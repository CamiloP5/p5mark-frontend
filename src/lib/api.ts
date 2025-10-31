//src/lib/api.ts
import { fetchGraphQL } from './graphql';
import { WPPost } from '@/types';

/**
 * Obtiene una lista de posts recientes desde WordPress.
 * @param count Número de posts a obtener.
 * @returns Array de objetos WPPost.
 */
export async function getPosts(count: number = 10): Promise<WPPost[]> {
  const query = /* GraphQL */ `
    query RecentPosts($count: Int) {
      posts(first: $count) {
        nodes {
          id
          slug
          title
          date
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  `;

  try {
    const data = await fetchGraphQL<{ posts: { nodes: WPPost[] } }>(query, { count });
    // Usamos el mismo filtro de validación que en el [slug]
    if (!data || !data.posts || !data.posts.nodes) return [];
    
    return data.posts.nodes.filter(post => post.slug && post.title); // Aseguramos que tengan slug y título
  } catch (e) {
    console.error("Error fetching recent posts for Home Page:", e);
    return [];
  }
}
//src/types.ts
//src/app/lib/api.ts
//src/app/lib/graphql.ts
//src/components/PostCard.tsx
//src/app/page.tsx
//src/app/[slug]/page.tsx
//src/app/layout.tsx
//src/components/PostCard.tsx
