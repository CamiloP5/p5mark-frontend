//src/app/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { fetchGraphQL } from '@/lib/graphql'; 
import { WPPost } from '@/types';
import parse from 'html-react-parser'; // Necesario para renderizar el contenido HTML

// Establecemos la Revalidación Estática Incremental (ISR)
export const revalidate = 3600; // 1 hora

// --------------------------------------------------------------------------
// FUNCIÓN AUXILIAR: Obtiene TODOS los slugs para la pre-generación estática
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
      if (!data || !data.posts || !data.posts.nodes) {
          console.error("[generateStaticParams] GraphQL response for slugs is malformed.");
          return [];
      }
      const slugs = data.posts.nodes
          .map(node => node.slug)
          .filter(slug => slug);
      
      console.log(`[generateStaticParams] Fetched ${slugs.length} slugs for build.`);
      return slugs;
  } catch (e) {
      console.error("❌ CRITICAL ERROR fetching all post slugs for generateStaticParams:", e);
      return []; 
  }
}

// --------------------------------------------------------------------------
// FUNCIÓN DE NEXT.JS: Indica qué páginas deben generarse en el build (CRUCIAL)
// --------------------------------------------------------------------------
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

// --------------------------------------------------------------------------
// FUNCIÓN DE DATOS: Obtiene el post INDIVIDUAL por su slug
// --------------------------------------------------------------------------
async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const query = /* GraphQL */ `
    query PostBySlug($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        id
        slug
        title
        date
        content(format: RENDERED)
        featuredImage { node { sourceUrl altText } }
      }
    }
  `;
  try {
      if (!slug) {
        console.warn("getPostBySlug received an empty slug.");
        return null;
      }
      const data = await fetchGraphQL<{ post: WPPost | null }>(query, { slug });
      return data.post;
  } catch (e) {
      console.error(`Error fetching post with slug ${slug}:`, e);
      return null;
  }
}

// --------------------------------------------------------------------------
// COMPONENTE DE LA PÁGINA (ESTO ES LO QUE SE RENDERIZA)
// --------------------------------------------------------------------------
export default async function PostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  if (!slug) return notFound();

  const post = await getPostBySlug(slug);
  
  // Si el post no se encuentra (devuelto null por el fetch), muestra un 404
  if (!post) return notFound(); 

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
        {post.title}
      </h1>
      
      {post.date && (
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          Publicado el {new Date(post.date).toLocaleDateString()}
        </p>
      )}

      {post.featuredImage?.node?.sourceUrl && (
        <img
          src={post.featuredImage.node.sourceUrl}
          alt={post.featuredImage.node.altText || post.title}
          style={{ width: '100%', height: 'auto', borderRadius: 8, marginBottom: '2rem' }}
        />
      )}

      {/* Aquí renderizamos el contenido HTML del post */}
      <article style={{ lineHeight: 1.7, fontSize: '1.125rem', color: '#374151' }}>
        {post.content ? parse(post.content) : <p>This post has no content.</p>}
      </article>
    </main>
  );
}

