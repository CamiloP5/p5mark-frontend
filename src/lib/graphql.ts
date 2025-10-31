const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://p5marketing.com/graphql';
const MAX_RETRIES = 3;

/**
 * Función para hacer peticiones GraphQL con lógica de reintento.
 * Esto es crucial para la estabilidad de generateStaticParams durante el build de Vercel,
 * que a veces falla por errores de red transitorios.
 */
export async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, any> = {},
  options: { retries: number } = { retries: 0 }
): Promise<T> {
    const { retries } = options;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
            // Usamos 'force-cache' para el build (generateStaticParams) y 'no-cache' si quieres evitar el caché en tiempo de ejecución.
            // Para ISR (revalidate), 'next' es suficiente. Lo mantendremos así:
            next: { revalidate: 300 }, // Cache de 5 min
        });

        if (!res.ok) {
            throw new Error(`GraphQL HTTP ${res.status} - ${res.statusText}`);
        }

        const json = await res.json();

        if (json.errors) {
            // Un error GraphQL (ej. el slug no existe)
            throw new Error(JSON.stringify(json.errors));
        }

        return json.data;
    } catch (error) {
        if (retries < MAX_RETRIES) {
            const nextRetries = retries + 1;
            console.warn(`[GraphQL Fetch] Falló la petición. Reintentando (${nextRetries}/${MAX_RETRIES})... Error: ${error.message}`);
            
            // Espera exponencial antes de reintentar (1s, 2s, 4s...)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
            
            return fetchGraphQL<T>(query, variables, { retries: nextRetries });
        }
        
        // Si fallan todos los reintentos, lanza el error.
        console.error(`[GraphQL Fetch] Falló la petición después de ${MAX_RETRIES} intentos. URL: ${API_URL}`);
        throw error;
    }
}
