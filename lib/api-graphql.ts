// lib/api-graphql.ts
import type { WPPost } from './types';

const GQL = process.env.NEXT_PUBLIC_WP_GRAPHQL!;
type GqlResponse<T> = { data: T; errors?: any };

async function gql<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const res = await fetch(GQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 }, // ISR
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
  const json: GqlResponse<T> = await res.json();
  if (json.errors) throw new Error('GraphQL errors');
  return json.data;
}

function mapPost(n: any): WPPost {
  const img = n.featuredImage?.node;
  return {
    id: n.databaseId,
    slug: n.slug,
    title: n.title ?? '',
    excerpt: n.excerpt ?? '',
    content: n.content, // para single
    date: n.date,
    featuredImage: img
      ? {
          src: img.sourceUrl,
          alt: img.altText || '',
          width: img.mediaDetails?.width,
          height: img.mediaDetails?.height,
        }
      : null,
  };
}

export async function gqlFetchPosts(): Promise<WPPost[]> {
  const query = /* GraphQL */ `
    query Posts {
      posts(first: 12) {
        nodes {
          databaseId
          slug
          date
          title
          excerpt
          featuredImage {
            node { sourceUrl altText mediaDetails { width height } }
          }
        }
      }
    }
  `;
  const data = await gql<{ posts: { nodes: any[] } }>(query);
  return data.posts.nodes.map(mapPost);
}

export async function gqlFetchPost(slug: string): Promise<WPPost | null> {
  const query = /* GraphQL */ `
    query PostBySlug($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        databaseId
        slug
        date
        title
        content
        featuredImage {
          node { sourceUrl altText mediaDetails { width height } }
        }
      }
    }
  `;
  const data = await gql<{ post: any }>(query, { slug });
  return data.post ? mapPost(data.post) : null;
}
