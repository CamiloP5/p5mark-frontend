// src/app/[slug]/page.tsx

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

// --- ESTRATEGIA DE RENDERIZADO: ISR (Generación Estática Incremental) ---
// Next.js intentará generar esta página estáticamente en tiempo de build.
// Si no está en generateStaticParams, la generará bajo demanda (fallback).
// Luego, la regenerará en el servidor cada 3600 segundos (1 hora).
export const revalidate = 3600; 
// Eliminamos: export const dynamic = 'force-dynamic';

// --------------------------------------------------------------------------
// FUNCIÓN AUXILIAR: Obtiene todos los slugs para la pre-generación estática
// --------------------------------------------------------------------------
async function getAllPostSlugs(): Promise<string[]> {
  const query = /* GraphQL */ `
    query AllPostsSlugs {
      posts(first: 100) { # Ajusta el 'first' según el límite de posts que tengas
        nodes {
          slug
        }
      }
    }
  `;
  // Asumiendo que fetchGraphQL maneja la estructura de la respuesta
  const data = await fetchGraphQL<{ posts: { nodes: { slug: string }[] } }>(query);
  return data.posts.nodes.map(node => node.slug);
}

// --------------------------------------------------------------------------
// FUNCIÓN DE NEXT.JS: Indica qué páginas deben generarse en el build
// --------------------------------------------------------------------------
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  
  // Devuelve un array de objetos con el parámetro dinámico.
  // Esto genera rutas como /mi-slug-1, /mi-slug-2, etc., en tiempo de build.
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
  // La revalidación (revalidate = 3600) se encarga de que esta llamada
  // se refresque periódicamente en el servidor de Vercel.
  const data = await fetchGraphQL<{ post: WPPost | null }>(query, { slug });
  return data.post;
}

// --------------------------------------------------------------------------
// COMPONENTE DE LA PÁGINA
// --------------------------------------------------------------------------
export default async function PostPage({ params }: { params: { slug: string } }) {
  // Ya no necesitamos 'decodeURIComponent' ni el 'trim()' porque el slug 
  // que viene de Vercel ya debería estar limpio.
  const { slug } = params;
  
  if (!slug) return notFound(); // Esto es una verificación de seguridad

  const post = await getPostBySlug(slug);
  
  // Si el post no existe o el fetch falló, Next.js devuelve un 404 (funciona bien)
  if (!post) return notFound(); 

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>{post.title}</h1>

      {post.featuredImage?.node?.sourceUrl && (
        // *Recomendación:* Usar el componente <Image> de Next.js para optimización
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
