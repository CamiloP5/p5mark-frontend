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
    featuredImage?: WPImage | null;
};
