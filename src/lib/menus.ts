// src/lib/menus.ts
import { fetchGraphQL } from '@/lib/graphql';

export type WPMenuItem = {
  id: string;
  label: string;
  url: string;
  parentId?: string | null;
  childItems?: { nodes: WPMenuItem[] };
};

type MenuResponse = {
  menu?: {
    id: string;
    name: string;
    menuItems: { nodes: WPMenuItem[] };
  } | null;
};

const MENU_BY_LOCATION = /* GraphQL */ `
  query MenuByLocation($location: MenuLocationEnum!) {
    menu(where: { location: $location }) {
      id
      name
      menuItems(first: 200) {
        nodes {
          id
          label
          url
          parentId
          childItems(first: 50) {
            nodes { id label url parentId }
          }
        }
      }
    }
  }
`;

const MENU_BY_SLUG = /* GraphQL */ `
  query MenuBySlug($slug: ID!) {
    menu(id: $slug, idType: SLUG) {
      id
      name
      menuItems(first: 200) {
        nodes {
          id
          label
          url
          parentId
          childItems(first: 50) {
            nodes { id label url parentId }
          }
        }
      }
    }
  }
`;

/** Obtiene un menú por ubicación registrada en WP (ej: PRIMARY, FOOTER). */
export async function getMenuByLocation(location: 'PRIMARY' | 'FOOTER' | string) {
  const data = await fetchGraphQL<MenuResponse>(MENU_BY_LOCATION, { location });
  return data.menu ?? null;
}

/** Alternativa por slug del menú (ej: "primary" o "main-menu"). */
export async function getMenuBySlug(slug: string) {
  const data = await fetchGraphQL<MenuResponse>(MENU_BY_SLUG, { slug });
  return data.menu ?? null;
}
