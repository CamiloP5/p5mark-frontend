// lib/api-rest.ts
const API_URL = process.env.NEXT_PUBLIC_WP_URL!;
import type { WPPost } from './types';

// — Helpers —
function pickMediaSrc(media: any, post: any) {
  // 1) Lo “normal”
  const direct =
    media?.source_url ||
    media?.media_details?.sizes?.full?.source_url ||
    media?.media_details?.sizes?.large?.source_url;

  // 2) Jetpack (muchos sitios lo exponen)
  const jetpack = post?.jetpack_featured_media_url;

  return direct || jetpack || null;
}

function pickDims(media: any) {
  const md = media?.media_details;
  if (!md) return { width: undefined, height: undefined };

  // Prioriza 'full', luego 'large'
  const full = md?.sizes?.full;
  const large = md?.sizes?.large;

  return {
    width: (full?.width ?? md?.width ?? large?.width) || undefined,
    height: (full?.height ?? md?.height ?? large?.height) || undefined,
  };
}

function mapPost(item: any): WPPost {
  const media = item?._embedded?.['wp:featuredmedia']?.[0];
  const src = pickMediaSrc(media, item);

  const { width, height } = pickDims(media);

  return {
    id: item.id,
    slug: item.slug,
    title: item.title?.rendered ?? '',
    excerpt: item.excerpt?.rendered ?? '',
    content: item.content?.rendered ?? '',
    date: item.date,
    featuredImage: src
      ? {
          src,
          alt: media?.alt_text || media?.title?.rendered || item?.title?.rendered || '',
          width,
          height,
        }
      : null,
  };
}

// Fallback puntual (solo para un post) si no llega embebido
async function fetchMediaById(id: number) {
  if (!id) return null;
  const r = await fetch(`${API_URL}/wp-json/wp/v2/media/${id}`);
  if (!r.ok) return null;
  return r.json();
}

export async function fetchPosts({ perPage = 10 } = {}) {
  // _embed=1 y filtramos campos para no arrastrar basura
  const url = `${API_URL}/wp-json/wp/v2/posts?_embed=1&per_page=${perPage}&_fields=id,slug,title,excerpt,content,date,featured_media,_embedded,jetpack_featured_media_url`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Error fetching posts');
  const data = await res.json();
  return data.map(mapPost);
}

export async function fetchPostBySlug(slug: string): Promise<WPPost | null> {
  const cleaned = decodeURIComponent(slug).trim().toLowerCase();

  const base = `${API_URL}/wp-json/wp/v2/posts`;
  const params = `&_embed=1&_fields=id,slug,title,excerpt,content,date,featured_media,_embedded,jetpack_featured_media_url`;

  // 1) Buscar por slug exacto
  let res = await fetch(`${base}?slug=${encodeURIComponent(cleaned)}${params}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Error fetching post by slug');
  let items = await res.json();

  // Si llegó, mapeamos
  if (items?.length) {
    let post = mapPost(items[0]);

    // Fallback: si NO hay featuredImage, intentamos traer el media por ID
    if (!post.featuredImage && items[0]?.featured_media) {
      const media = await fetchMediaById(items[0].featured_media);
      const src =
        media?.source_url ||
        media?.media_details?.sizes?.full?.source_url ||
        media?.media_details?.sizes?.large?.source_url;
      if (src) {
        const { width, height } = pickDims(media);
        post = {
          ...post,
          featuredImage: {
            src,
            alt: media?.alt_text || media?.title?.rendered || post.title || '',
            width,
            height,
          },
        };
      }
    }
    return post;
  }

  // 2) Fallback por búsqueda de texto
  res = await fetch(`${base}?search=${encodeURIComponent(cleaned)}${params}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Error searching post');
  items = await res.json();

  const exact = items.find((it: any) => (it?.slug || '').toLowerCase() === cleaned);
  return exact ? mapPost(exact) : null;
}
