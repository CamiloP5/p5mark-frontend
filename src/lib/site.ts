// src/lib/site.ts
import { fetchGraphQL } from '@/lib/graphql';

export type SiteInfo = {
  title: string;
  description: string;
};

export type WPImageNode = {
  id: string;
  sourceUrl: string;
  altText?: string | null;
  mediaType?: string | null;
};

type SiteInfoRes = {
  generalSettings: { title: string; description: string };
};

type MediaSearchRes = {
  mediaItems: { nodes: WPImageNode[] };
};

const SITE_INFO = /* GraphQL */ `
  query SiteInfo {
    generalSettings {
      title
      description
    }
  }
`;

/**
 * Busca imágenes por texto libre (por ejemplo: "logo", "site logo", "brand").
 * Devuelve la primera coincidencia (o null).
 */
const MEDIA_SEARCH = /* GraphQL */ `
  query MediaSearch($search: String!, $first: Int = 5) {
    mediaItems(first: $first, where: { search: $search, mediaType: IMAGE }) {
      nodes {
        id
        sourceUrl
        altText
        mediaType
      }
    }
  }
`;

export async function getSiteInfo(): Promise<SiteInfo> {
  const data = await fetchGraphQL<SiteInfoRes>(SITE_INFO);
  return {
    title: data.generalSettings?.title ?? 'Site',
    description: data.generalSettings?.description ?? '',
  };
}

/**
 * Intenta obtener el logo buscando por término. Por defecto: "logo".
 * Puedes pasar "site logo", "brand", etc. según tu librería de medios.
 */
export async function getLogo(searchTerm = 'logo'): Promise<WPImageNode | null> {
  const data = await fetchGraphQL<MediaSearchRes>(MEDIA_SEARCH, { search: searchTerm, first: 5 });
  return data.mediaItems?.nodes?.[0] ?? null;
}
