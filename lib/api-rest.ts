const API_URL = process.env.NEXT_PUBLIC_WP_URL!;
import type { WPPost } from './types';

function mapPost(item: any):WPPost {
    const media = item._embedded?.['wp:featuredmedia']?.[0];
    return {
        id: item.id,
        slug: item.slug,
        title: item.title?.rendered ?? '',
        excerpt: item.excerpt?.rendered ?? '',
        content: item.content?.rendered ?? '',
        date: item.date,
        featuredImage: media
        ? {
        src: media.source_url,
        alt: media.alt_text || media.title?.rendered || '',
        width: media.media_details?.width,
        height: media.media_details?.height,
        }
        : null,
    };
}


export async function fetchPosts({ perPage = 10 } = {}) {
    const res = await fetch(`${API_URL}/wp-json/wp/v2/posts?_embed&per_page=${perPage}`, { next: { revalidate: 60 } });
      if (!res.ok) throw new Error('Error fetching posts');
      const data = await res.json();
      return data.map(mapPost);
}


export async function fetchPostBySlug(slug: string): Promise<WPPost | null> {
  const cleaned = decodeURIComponent(slug).trim().toLowerCase();

  // 1) Búsqueda directa por slug
  let res = await fetch(
    `${API_URL}/wp-json/wp/v2/posts?slug=${encodeURIComponent(cleaned)}&_embed`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error('Error fetching post by slug');
  let items = await res.json();
  if (items?.length) return mapPost(items[0]);

  // 2) Fallback: buscar por texto (por si el slug no matchea)
  res = await fetch(
    `${API_URL}/wp-json/wp/v2/posts?search=${encodeURIComponent(cleaned)}&_embed`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error('Error searching post');
  items = await res.json();
  // intenta encontrar coincidencia exacta de slug entre los resultados
  const exact = items.find((it: any) => (it?.slug || '').toLowerCase() === cleaned);
  return exact ? mapPost(exact) : null;
}


