// src/lib/api.ts
// trigger redeploy
import { fetchGraphQL } from './graphql';

type WPImage = { node?: { sourceUrl?: string; altText?: string } };
export type WPPost = {
  id: string;
  slug: string;
  title: string;
  date?: string;
  excerpt?: string;
  featuredImage?: WPImage;
};

export async function getPosts(limit = 10): Promise<WPPost[]> {
  const query = /* GraphQL */ `
    query AllPosts($first: Int!) {
      posts(first: $first, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
        nodes {
          id
          slug
          title
          date
          excerpt
          featuredImage { node { sourceUrl altText } }
        }
      }
    }
  `;
  const data = await fetchGraphQL<{ posts: { nodes: WPPost[] } }>(query, { first: limit });
  return data.posts.nodes ?? [];
}
