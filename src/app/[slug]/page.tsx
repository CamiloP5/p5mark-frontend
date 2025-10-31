//src/app/[slug]/page.tsx
import PostCard from '@/components/PostCard';
import { fetchGraphQL } from '@/lib/graphql';
import { WPPost } from '@/types';

// Establecemos Revalidación Estática Incremental para la página principal
export const revalidate = 600; // 10 minutos de caché

// --------------------------------------------------------------------------
// FUNCIÓN DE DATOS: Obtiene una lista de posts
// --------------------------------------------------------------------------
async function getPosts(): Promise<WPPost[]> {
    const query = /* GraphQL */ `
        query AllPosts {
            posts(first: 10, where: { status: PUBLISH }) {
                nodes {
                    id
                    slug
                    title
                    date
                    featuredImage { node { sourceUrl altText } }
                }
            }
        }
    `;
    try {
        // Usamos el fetcher de GraphQL
        const data = await fetchGraphQL<{ posts: { nodes: WPPost[] } }>(query);
        return data.posts.nodes;
    } catch (e) {
        console.error("❌ ERROR fetching post list for home page:", e);
        return [];
    }
}

// --------------------------------------------------------------------------
// COMPONENTE DE LA PÁGINA PRINCIPAL
// --------------------------------------------------------------------------
export default async function Home() {
  const posts = await getPosts();

  if (!posts || posts.length === 0) {
    return (
        <div className="container mx-auto p-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Blog</h1>
            <p className="text-gray-600">No se encontraron posts. Verifica tu conexión GraphQL y la configuración de Vercel.</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Últimos Posts de WordPress</h1>
      {/* Utilizamos un diseño basado en Tailwind con grid para la lista */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          // Usamos el componente PostCard
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
