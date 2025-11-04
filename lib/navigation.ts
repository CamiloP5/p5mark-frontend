// lib/navigation.ts
const GQL = process.env.NEXT_PUBLIC_WP_GRAPHQL!;
type Gql<T> = { data: T; errors?: any };

async function gql<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const res = await fetch(GQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
  const json: Gql<T> = await res.json();
  if (json.errors) {
    console.error('WPGraphQL errors:', JSON.stringify(json.errors, null, 2));
    throw new Error(json.errors[0]?.message || 'GraphQL errors');
  }
  return json.data;
}

export type NavItem = { id: string; label: string; href: string; children?: NavItem[] };

function toRelative(url: string): string {
  try { const u = new URL(url); return (u.pathname || '/') + (u.search || ''); } catch { return url || '/'; }
}
const mapNode = (n: any): NavItem => ({
  id: String(n.id),
  label: n.label,
  href: toRelative(n.url || '/'),
  children: n.childItems?.nodes?.length ? n.childItems.nodes.map(mapNode) : undefined,
});

/** Descubre el slug del menú: intenta env → alguno con locations → primero disponible */
async function discoverMenuSlug(fallback = 'main-menu'): Promise<string | null> {
  const prefer = process.env.NEXT_PUBLIC_WP_MENU_SLUG; // opcional
  if (prefer) return prefer;

  const q = /* GraphQL */ `
    query {
      menus(first: 50) {
        nodes { slug name locations count }
      }
    }
  `;
  const d = await gql<{ menus: { nodes: Array<{ slug: string; locations?: string[]; count: number }> } }>(q);
  const nodes = d.menus?.nodes || [];
  if (!nodes.length) return null;

  const withItems = nodes.filter(n => n.count > 0);
  const withLocation = withItems.find(n => (n.locations?.length ?? 0) > 0);
  return (withLocation?.slug || withItems[0]?.slug || nodes[0]?.slug || fallback) ?? null;
}

/** Menú principal por slug (auto-descubre si no se pasa) */
// lib/navigation.ts (fragmento clave)
export async function getPrimaryNav(): Promise<NavItem[]> {
  const slug = process.env.NEXT_PUBLIC_WP_MENU_SLUG || 'menu-primary'; // 👈 aquí
  const q = /* GraphQL */ `
    query MenuBySlug($id: ID!) {
      menu(id: $id, idType: SLUG) {
        menuItems(where: { parentId: 0 }, first: 100) {
          nodes {
            id
            label
            url
            childItems(first: 100) {
              nodes {
                id
                label
                url
                childItems(first: 100) { nodes { id label url } }
              }
            }
          }
        }
      }
    }
  `;
  const d = await gql<{ menu: { menuItems: { nodes: any[] } } | null }>(q, { id: slug });
  const nodes = d.menu?.menuItems?.nodes || [];
  return nodes.map(mapNode); // usando tu mapNode/toRelative
}

// Footer nav similar
export async function getFooterNav(): Promise<NavItem[]> {
  const slug = process.env.NEXT_PUBLIC_WP_FOOTER_MENU_SLUG || 'footer-menu';
  const q = /* GraphQL */ `
    query MenuBySlug($id: ID!) {
      menu(id: $id, idType: SLUG) {
        menuItems(where: { parentId: 0 }, first: 100) {
          nodes {
            id
            label
            url
          }
        }
      }
    }
  `;
  const d = await gql<{ menu: { menuItems: { nodes: any[] } } | null }>(q, { id: slug });
  const nodes = d.menu?.menuItems?.nodes || [];
  return nodes.map(mapNode);
}