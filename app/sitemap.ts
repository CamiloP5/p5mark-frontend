// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { fetchPosts } from '@/lib/api-rest';
import type { WPPost } from '@/lib/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const posts: WPPost[] = await fetchPosts({ perPage: 50 });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date() }
  ];

  const postRoutes = posts.map(
    (p: WPPost): MetadataRoute.Sitemap[number] => ({
      url: `${base}/posts/${p.slug}`,
      lastModified: p.date ? new Date(p.date) : new Date(),
    })
  );

  return [...staticRoutes, ...postRoutes];
}
