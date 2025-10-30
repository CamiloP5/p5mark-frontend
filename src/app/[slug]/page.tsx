// src/app/post/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { fetchGraphQL } from '@/lib/graphql';
import parse from 'html-react-parser';

type WPImage = { node?: { sourceUrl?: string; altText?: string } };
type WPPost = {
  id: string;
  slug: string;
  title: string;
  date?: string;
  content?: string;
  featuredImage?: WPImage;
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const query = /* GraphQL */ `
    query PostBySlug($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        id
        slug
        title
        date
        content
        featuredImage { node { sourceUrl altText } }
      }
    }
  `;
  const data = await fetchGraphQL<{ post: WPPost | null }>(query, { slug });
  return data.post;
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug ?? '').trim();
  if (!slug) return notFound();

  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>{post.title}</h1>

      {post.featuredImage?.node?.sourceUrl && (
        <img
          src={post.featuredImage.node.sourceUrl}
          alt={post.featuredImage.node.altText || post.title}
          style={{ width: '100%', borderRadius: 8, marginBottom: '1.5rem' }}
        />
      )}

      <article style={{ lineHeight: 1.6, color: '#374151' }}>
        {post.content ? parse(post.content) : <p>No content found.</p>}
      </article>
    </main>
  );
}
