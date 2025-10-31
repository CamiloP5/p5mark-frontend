import { fetchPosts } from '@/lib/api-rest';
import PostCard from '@/components/PostCard';
import { getPosts } from '@/lib/api';

export const revalidate = 60; // capa extra de ISR
export default async function HomePage() {
  const posts = await getPosts(); // ya no te importa si es REST o GQL
  return (
    <main className="mx-auto max-w-5xl p-6">
    <h1 className="text-3xl font-bold mb-6">Latest posts</h1>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  </main>
  );
}
