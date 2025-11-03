// app/[slug]/page.tsx
import { getPosts, getPost } from '@/lib/api'; // ← única fuente: GraphQL
import Image from 'next/image';
import { notFound } from 'next/navigation';

export const revalidate = 60;

type PostForStaticParams = { slug: string };

// Pre-genera slugs (evita 404 en build/ISR)
export async function generateStaticParams() {
  try {
    const posts: PostForStaticParams[] = await getPosts();
    return posts
      .filter((p) => p.slug)
      .map((p) => ({ slug: p.slug }));
  } catch (error) {
    console.error(
      'BUILD ERROR: Failed to fetch posts for generateStaticParams. API issue?',
      error
    );
    return [];
  }
}

export default async function PostPage({
  params,
}: {
  // Si en tu versión de Next params es Promise, dejamos este patrón:
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await getPost(slug);
  if (!post) return notFound();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1
        className="text-3xl font-bold mb-4"
        dangerouslySetInnerHTML={{ __html: post.title }}
      />

      {post.featuredImage?.src && (
        <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-xl">
          <Image
            src={post.featuredImage.src}
            alt={post.featuredImage.alt || ''}
            fill
            style={{ objectFit: 'cover' }}
            priority
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
