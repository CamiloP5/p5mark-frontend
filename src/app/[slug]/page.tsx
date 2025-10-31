  import { notFound } from 'next/navigation';
  import { fetchGraphQL } from '@/lib/graphql'; 
  import { WPPost } from '@/types';
  import parse from 'html-react-parser'; 

  export const revalidate = 3600; 
  // --- LA SOLUCIÓN ---
  // Le decimos a Next.js que intente renderizar slugs
  // que no fueron encontrados en generateStaticParams
  export const dynamicParams = true; 
  // --- FIN DE LA SOLUCIÓN ---

  // --- (Función getAllPostSlugs) ---
  async function getAllPostSlugs(): Promise<string[]> {
  const query = /* GraphQL */ `
    query AllPostsSlugs {
      posts(first: 1000) { nodes { slug } }
    }
  `;
  try {
      const data = await fetchGraphQL<{ posts: { nodes: { slug: string }[] } }>(query);
      if (!data || !data.posts || !data.posts.nodes) {
          console.error("[generateStaticParams] GraphQL response for slugs is malformed.");
          return [];
      }
      const slugs = data.posts.nodes.map(node => node.slug).filter(slug => slug);
      console.log(`[generateStaticParams] Fetched ${slugs.length} slugs for build.`);
      // --- DEBUGGING ---
      // Imprime los primeros 10 slugs para ver qué está obteniendo
      console.log(`[generateStaticParams] Sample slugs: ${slugs.slice(0, 10).join(', ')}`);
      // --- FIN DEBUGGING ---
      return slugs;
  } catch (e) {
      console.error("❌ CRITICAL ERROR fetching all post slugs for generateStaticParams:", e);
      return []; 
  }
}

// --- (Función generateStaticParams) ---
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug: slug }));
}

// --- (Función getPostBySlug) ---
async function getPostBySlug(slug: string): Promise<WPPost | null> {
  // --- DEBUGGING ---
  // Logueamos el slug que estamos a punto de fetchear
  console.log(`[getPostBySlug] Attempting to fetch post with slug: ${slug}`);
  // --- FIN DEBUGGING ---
  
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
        console.warn("[getPostBySlug] received an empty slug.");
        return null;
      }
      const data = await fetchGraphQL<{ post: WPPost | null }>(query, { slug });
      
      if (!data || !data.post) {
         console.warn(`[getPostBySlug] No post found for slug: ${slug}. (data.post is null or undefined)`);
         return null;
      }
      console.log(`[getPostBySlug] Successfully fetched post: ${data.post.title}`);
      return data.post;
  } catch (e) {
      console.error(`❌ CRITICAL ERROR fetching post with slug ${slug}:`, e);
      return null;
  }
}

// --------------------------------------------------------------------------
// COMPONENTE DE LA PÁGINA (AQUÍ ESTÁ EL DEBUGGING PRINCIPAL)
// --------------------------------------------------------------------------
export default async function PostPage({ params }: { params: { slug: string } }) {
  
  // --- DEBUGGING ---
  // ESTE ES EL LOG MÁS IMPORTANTE.
  // ¿Qué parámetros está recibiendo esta página del enrutador?
  console.log(`[PostPage] Rendering page. Params received: ${JSON.stringify(params)}`);
  // --- FIN DEBUGGING ---

  const { slug } = params;
  
  if (!slug) {
    console.log("[PostPage] Slug is missing or empty, calling notFound().");
    return notFound();
  }

  const post = await getPostBySlug(slug);
  
  if (!post) {
    console.log(`[PostPage] getPostBySlug returned null for slug: ${slug}. Calling notFound().`);
    return notFound();
  } 

  // --- (Renderizado del post - sin cambios) ---
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
      <article style={{ lineHeight: 1.7, fontSize: '1.125rem', color: '#374151' }}>
        {post.content ? parse(post.content) : <p>This post has no content.</p>}
      </article>
    </main>
  );
}

