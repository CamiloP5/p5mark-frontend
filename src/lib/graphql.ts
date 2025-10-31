// src/lib/graphql.ts (Versión simplificada del Caching)
const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://p5marketing.com/graphql';
const MAX_RETRIES = 3;

export async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, any> = {},
  retries = 0
): Promise<T> {
  // Eliminamos la lógica de caché basada en retries. 
  // La estrategia de revalidación debe ser controlada por el Server Component ([slug]/page.tsx).

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      // Next.js por defecto intentará cachear si no especificas nada más.
      // Las funciones de datos que usan esta API (como getPostBySlug) controlan el 'revalidate'.
    });

    if (!res.ok) {
      throw new Error(`GraphQL HTTP ${res.status} error during fetch.`);
    }

    const json = await res.json();

    if (json.errors) {
      throw new Error(JSON.stringify(json.errors, null, 2));
    }

    return json.data;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      // Lógica de reintento: (Mantenemos esta parte, ya que es robusta)
      const nextRetries = retries + 1;
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.warn(`[GraphQL Fetch] Falló la petición. Reintentando (${nextRetries}/${MAX_RETRIES})... Error: ${errorMessage}`);
      
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
      
      return fetchGraphQL(query, variables, nextRetries);
    }
    
    throw error;
  }
}