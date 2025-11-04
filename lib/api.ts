// lib/api.ts
import type { WPPost, SiteCustomSettings, AcfLink, SiteFooterSettings } from './types';


function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Falta ${name} (ej: https://p5marketing.com/graphql)`);
  return v;
}

const GQL = requiredEnv('NEXT_PUBLIC_WP_GRAPHQL'); // <- ahora es string

type GqlResponse<T> = { data: T; errors?: any };

async function gql<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const res = await fetch(GQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 }, // ISR
  });

  if (!res.ok) {
    console.error(`GraphQL HTTP ${res.status} - ${res.statusText}`);
    throw new Error(`GraphQL HTTP ${res.status}`);
  }

  const json: GqlResponse<T> = await res.json();

  if (json.errors) {
    // 👇 Este bloque es el que debes agregar
    console.error('WPGraphQL errors:', JSON.stringify(json.errors, null, 2));

    // Si quieres, puedes imprimir también la query para depurar
    console.error('Query with error:', query);

    throw new Error(json.errors[0]?.message || 'GraphQL errors');
  }

  return json.data;
}

// Normaliza el post al shape WPPost (incluye fallbacks de imagen)
function mapPost(n: any): WPPost {
  const img = n.featuredImage?.node;

  // Fallbacks: sourceUrl -> size(full) -> size(large) -> mediaItemUrl
  const sizes: Array<any> | undefined = img?.mediaDetails?.sizes;
  const sizeFull = sizes?.find(s => s?.name === 'full');
  const sizeLarge = sizes?.find(s => s?.name === 'large');

  const src =
    img?.sourceUrl ||
    sizeFull?.sourceUrl ||
    sizeLarge?.sourceUrl ||
    img?.mediaItemUrl ||
    null;

  return {
    id: n.databaseId,
    slug: n.slug,
    title: n.title ?? '',
    excerpt: n.excerpt ?? '',
    content: n.content ?? undefined,
    date: n.date ?? undefined,
    featuredImage: src
      ? {
          src,
          alt: img?.altText || '',
          width: img?.mediaDetails?.width ?? sizeFull?.width ?? sizeLarge?.width,
          height: img?.mediaDetails?.height ?? sizeFull?.height ?? sizeLarge?.height,
        }
      : null,
  };
}

// === Public API ===
export async function getPosts(): Promise<WPPost[]> {
  const query = /* GraphQL */ `
    query Posts {
      posts(first: 12) {
        nodes {
          databaseId
          slug
          date
          title
          excerpt
          featuredImage {
            node {
              sourceUrl
              mediaItemUrl
              altText
              mediaDetails {
                width
                height
                sizes {
                  name
                  sourceUrl
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  `;
  const data = await gql<{ posts: { nodes: any[] } }>(query);
  return data.posts.nodes.map(mapPost);
}

export async function getPost(slug: string): Promise<WPPost | null> {
  const query = /* GraphQL */ `
    query PostBySlug($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        databaseId
        slug
        date
        title
        content
        featuredImage {
          node {
            sourceUrl
            mediaItemUrl
            altText
            mediaDetails {
              width
              height
              sizes {
                name
                sourceUrl
                width
                height
              }
            }
          }
        }
      }
    }
  `;
  const data = await gql<{ post: any }>(query, { slug });
  return data.post ? mapPost(data.post) : null;
}

function normalizeLink(link?: AcfLink | null): AcfLink | null {
  if (!link?.url) return null;
  const url = link.url.trim();
  const target = link.target && link.target.trim() ? link.target : undefined;
  const title = link.title && link.title.trim() ? link.title : undefined;
  return { url, target, title };
}

export async function getSiteCustomSettings(): Promise<SiteCustomSettings> {
  const query = /* GraphQL */ `
    query OptionsFields {
      mainLogo {
        siteCustomSettings {
          fieldGroupName
          mainLogo {
            node { id mediaItemUrl mediaItemId }
          }
          navbarCtaLabel
          navbarCta { title url target }
        }
      }
    }
  `;

  try {
    const data = await gql<{
      mainLogo?: {
        siteCustomSettings?: {
          navbarCta?: AcfLink | null;
          mainLogo?: { node?: { id?: string | null; mediaItemUrl?: string | null; mediaItemId?: number | null } | null } | null;
        } | null;
      } | null;
    }>(query);

    const s = data?.mainLogo?.siteCustomSettings;
    const n = s?.mainLogo?.node;

    return {
    
      navbarCta: normalizeLink(s?.navbarCta),
      logo: n?.mediaItemUrl
        ? { url: n.mediaItemUrl, id: n.id ?? null, mediaItemId: n.mediaItemId ?? null }
        : null,
    };
  } catch (e) {
    console.warn('getSiteCustomSettings(): fallback vacío', e);
    return {
      navbarCta: null,
      logo: null,
    };
  }
}

function mapLogoFooter(raw: any) {
  // Soporta: logoFooter { id, mediaItemUrl, mediaItemId }  ó  logoFooter { node { ... } }
  const n = raw?.node ?? raw;
  if (!n?.mediaItemUrl) return null;
  return {
    url: n.mediaItemUrl as string,
    id: (n.id as string) ?? null,
    mediaItemId: (n.mediaItemId as number) ?? null,
  };
}

export async function getFooterSettings(): Promise<SiteFooterSettings> {
  const query = /* GraphQL */ `
    query FooterSettings {
      settingsFooter {
        siteFooterSettings {
          logoFooter {
            id
            mediaItemUrl
            mediaItemId
            # Si tu esquema usa node{} descomenta el bloque de abajo
            # node {
            #   id
            #   mediaItemUrl
            #   mediaItemId
            # }
          }
          phoneNumber
          localAddress
          contactEmail
        }
      }
    }
  `;

  const data = await gql<{
    settingsFooter?: {
      siteFooterSettings?: {
        logoFooter?: any;
        phoneNumber?: string | null;
        localAddress?: string | null;
        contactEmail?: string | null;
      } | null;
    } | null;
  }>(query);

  const s = data?.settingsFooter?.siteFooterSettings;

  return {
    logo: mapLogoFooter(s?.logoFooter),
    phoneNumber: s?.phoneNumber ?? '',
    localAddress: s?.localAddress ?? '',
    contactEmail: s?.contactEmail ?? '',
  };
}