import { fetchPosts, fetchPostBySlug } from '@/lib/api-rest';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export const revalidate = 60;

// Definimos el tipo esperado para los datos que devuelve fetchPosts,
// solo necesitamos el slug para generateStaticParams.
type PostForStaticParams = {
  slug: string;
};

// (opcional, pero recomendado) pre-genera slugs para evitar 404
export async function generateStaticParams() {
  try {
    // Asumiendo que fetchPosts devuelve un array de PostForStaticParams[]
    const posts: PostForStaticParams[] = await fetchPosts({ perPage: 50 }); 
    
    // Aseguramos que solo devolvemos objetos con un slug válido
    return posts
      .filter(p => p.slug) 
      .map(p => ({ slug: p.slug }));
      
  } catch (error) {
    // 🚨 Capturamos el error de fetch y evitamos que detenga la compilación.
    // Esto es crucial para la robustez del build.
    console.error("BUILD ERROR: Failed to fetch posts for generateStaticParams. API issue?", error);
    return []; // Devolvemos un array vacío para que el build continúe.
  }
}

export default async function PostPage({
  params,
}: {
  // 👇 En Next 16, params es una Promise
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;              // 👈 UNWRAP
  const post = await fetchPostBySlug(slug);   // usa el slug ya “awaited”
  if (!post) return notFound();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1
        className="text-3xl font-bold mb-4"
        dangerouslySetInnerHTML={{ __html: post.title }}
      />
      {post.featuredImage && (
        <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-xl">
          <Image
            src={post.featuredImage.src}
            alt={post.featuredImage.alt || ''}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
      <article
        className="prose prose-neutral max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content || '' }}
      />
    </main>
  );
}
