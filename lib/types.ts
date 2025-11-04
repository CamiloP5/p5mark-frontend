// lib/types.ts
export type WPImage = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type WPPost = {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  date?: string;
  featuredImage: WPImage | null; // ← sin "?"
};

export type AcfLink = {
  title?: string | null;
  url?: string | null;
  target?: string | null; // _blank / _self / etc.
};

export type SiteCustomSettings = {
  navbarCta?: AcfLink | null;
  logo: null | {
    url: string;
    id?: string | null;
    mediaItemId?: number | null;
  };
};

export type SiteFooterSettings = {
  logo: null | {
    url: string;
    id?: string | null;
    mediaItemId?: number | null;
  };
  phoneNumber: string;
  localAddress: string;
  contactEmail: string;
};