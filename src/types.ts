// src/types.ts

/**
 * Define la estructura de la imagen destacada (featuredImage) de un post de WordPress.
 * Nota: GraphQL devuelve la URL y el texto alternativo dentro de un nodo anidado.
 */
export type WPImage = {
  node?: {
    sourceUrl?: string;
    altText?: string;
  };
};

/**
 * Define la estructura mínima y completa de un Post de WordPress que necesitamos.
 */
export type WPPost = {
  id: string;
  slug: string;
  title: string;
  date?: string;
  content?: string;
  featuredImage?: WPImage;
};

/**
 * Define la estructura de los menús de navegación.
 */
export type WPMenuItem = {
  id: string;
  label: string;
  path: string;
};

// Puedes añadir aquí otros tipos si los necesitas, como WPCategory, WPPage, etc.
