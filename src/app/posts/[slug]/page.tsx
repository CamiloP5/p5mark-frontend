import { notFound } from 'next/navigation';
import { fetchGraphQL } from '@/lib/graphql'; 
import parse from 'html-react-parser';
import { WPImage, WPPost } from '@/types'; 

// Establecemos la Revalidación Estática Incremental (ISR)
export const revalidate = 3600; 

// --------------------------------------------------------------------------
// FUNCIÓN AUXILIAR: Obtiene todos los slugs para la pre-generación estática
// --------------------------------------------------------------------------
async function getAllPostSlugs(): Promise<string[]> {
  const query = /* GraphQL */ `
    query AllPostsSlugs {
      posts(first: 1000) { 
        nodes {
          slug
        }
      }
    }
  `;
  try {
      const data = await fetchGraphQL<{ posts: { nodes: { slug: string }[] } }>(query);
      return data.posts.nodes.map(node => node.slug);
  } catch (e) {
      console.error("Error fetching all post slugs for generateStaticParams:", e);
      return []; 
  }
}

// --------------------------------------------------------------------------
// FUNCIÓN DE NEXT.JS: Indica qué páginas deben generarse en el build (CRUCIAL)
// --------------------------------------------------------------------------
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  
  // Mapeamos los slugs al formato { slug: string } requerido por Next.js
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

// --------------------------------------------------------------------------
// FUNCIÓN DE DATOS: Obtiene el post individual
// --------------------------------------------------------------------------
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
  try {
      const data = await fetchGraphQL<{ post: WPPost | null }>(query, { slug });
      return data.post;
  } catch (e) {
      console.error(`Error fetching post with slug ${slug}:`, e);
      return null;
  }
}

// --------------------------------------------------------------------------
// COMPONENTE DE LA PÁGINA
// --------------------------------------------------------------------------
export default async function PostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
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
