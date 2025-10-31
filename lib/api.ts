import type { WPPost } from './types';
import { fetchPosts, fetchPostBySlug } from './api-rest';
import { gqlFetchPosts, gqlFetchPost } from './api-graphql';

const PROVIDER = (process.env.NEXT_PUBLIC_WP_PROVIDER || 'rest').toLowerCase(); // 'rest' | 'graphql'

export async function getPosts(): Promise<WPPost[]> {
  return PROVIDER === 'graphql' ? gqlFetchPosts() : fetchPosts();
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  return PROVIDER === 'graphql' ? gqlFetchPost(slug) : fetchPostBySlug(slug);
}
