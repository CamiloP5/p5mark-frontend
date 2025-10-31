// src/app/[slug]/page.tsx

import { notFound } from 'next/navigation';
// Importamos la función que acabas de compartir
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

// Establecemos la Revalidación Estática Incremental (ISR)
// La página se regenerará en el servidor cada 3600 segundos (1 hora).
export const revalidate = 3600; 
// Eliminamos: export const dynamic = 'force-dynamic';

// --------------------------------------------------------------------------
// FUNCIÓN AUXILIAR: Obtiene todos los slugs para la pre-generación estática
// --------------------------------------------------------------------------
async function getAllPostSlugs(): Promise<string[]> {
  const query = /* GraphQL */ `
    query AllPostsSlugs {
      posts(first: 1000) { # Aumenté el límite a 1000 por si tienes muchos posts
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
      // Si falla al obtener los slugs en el build, loguea el error y devuelve un array vacío
      console.error("Error fetching all post slugs for generateStaticParams:", e);
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