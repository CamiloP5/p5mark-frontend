// src/app/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { fetchGraphQL } from '@/lib/graphql';
import parse from 'html-react-parser';

type WPImage = { node?: { sourceUrl?: string; altText?: string } };
type WPNode = {
  __typename: 'Post' | 'Page';
  id: string;
  slug: string;
  title: string;
  date?: string | null;
  content?: string | null;
  featuredImage?: WPImage | null;
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getNodeByUri(uri: string): Promise<WPNode | null> {
  const query = /* GraphQL */ `
    query NodeByUri($uri: String!) {
      nodeByUri(uri: $uri) {
        __typename
        ... on Post {
          id
          slug
          title
          date
          content
          featuredImage { node { sourceUrl altText } }
        }
        ... on Page {
          id
          slug
          title
          date
          content
          featuredImage { node { sourceUrl altText } }
        }
      }
    }
  `;
  const data = await fetchGraphQL<{ nodeByUri: WPNode | null }>(query, { uri });
  return data.nodeByUri ?? null;
}

export default async function PostPage({ params }: { params: { slug?: string } }) {
  const slug = decodeURIComponent(params?.slug ?? '').replace(/^\/+|\/+$/g, '');
  if (!slug) return notFound();

  // Probamos con "/slug/" (WordPress suele guardar la URI con slash final)
  const node = (await getNodeByUri(`/${slug}/`)) ?? (await getNodeByUri(`/${slug}`));
  if (!node) return notFound();

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>{node.title}</h1>

      {node.featuredImage?.node?.sourceUrl && (
        <img
          src={node.featuredImage.node.sourceUrl}
          alt={node.featuredImage.node.altText || node.title}
          style={{ width: '100%', borderRadius: 8, marginBottom: '1.5rem' }}
        />
      )}

      <article style={{ lineHeight: 1.6, color: '#374151' }}>
        {node.content ? parse(node.content) : <p>No content found.</p>}
      </article>
    </main>
  );
}
