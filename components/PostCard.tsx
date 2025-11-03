// components/PostCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import type { WPPost } from '@/lib/types';

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').trim();
}

export default function PostCard({ post }: { post: WPPost }) {
  const img = post.featuredImage;
  const excerptText = post.excerpt ? stripHtml(post.excerpt) : '';

  return (
    <article className="rounded-2xl border p-4 shadow-sm">
      {img?.src && (
        <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded-xl">
          <Image
            src={img.src}
            alt={img.alt || stripHtml(post.title)}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}


      <h2 className="text-xl font-semibold mb-2">
        <Link href={`/posts/${post.slug}`}>{stripHtml(post.title)}</Link>
      </h2>

      {excerptText && (
        <p className="text-sm opacity-80">{excerptText}</p>
      )}
    </article>
  );
}
