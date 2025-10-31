//src/lib/graphql.ts
const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://p5marketing.com/graphql';

// Configuración de reintentos
const MAX_RETRIES = 3;

/**
 * Función genérica para realizar consultas GraphQL con manejo de errores y reintentos.
 * @param query La cadena de la consulta GraphQL.
 * @param variables Un objeto con las variables de la consulta.
 * @returns La data esperada por la consulta.
 */
export async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, any> = {},
  retries = 0
): Promise<T> {
  const nextRevalidate = retries === 0 ? 300 : 0; // Solo cachear en el primer intento

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      // Usamos el caching de Next.js (ISR)
      next: { revalidate: nextRevalidate },
      cache: 'force-cache', // Usar caché por defecto
    });

    if (!res.ok) {
      // Si la respuesta no es 200 (ej. 404, 500)
      throw new Error(`GraphQL HTTP ${res.status} error during fetch.`);
    }

    const json = await res.json();

    if (json.errors) {
      // Si el servidor GraphQL responde 200, pero devuelve errores de consulta
      throw new Error(JSON.stringify(json.errors, null, 2));
    }

    return json.data;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      const nextRetries = retries + 1;
      
      // Manejo seguro del error 'unknown'
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.warn(`[GraphQL Fetch] Falló la petición. Reintentando (${nextRetries}/${MAX_RETRIES})... Error: ${errorMessage}`);
      
      // Espera exponencial antes de reintentar (1s, 2s, 4s...)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
      
      return fetchGraphQL(query, variables, nextRetries);
    }
    
    // Si agotamos los reintentos, lanzamos el error
    throw error;
  }
}
