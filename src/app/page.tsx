import { getPosts } from '@/lib/api';

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Latest Posts</h1>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.id}>
            <a
              href={`/${post.slug}`}
              className="block text-xl text-blue-600 hover:underline"
            >
              {post.title}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
