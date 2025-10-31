import { getPosts } from '@/lib/api';
import Link from 'next/link'; // <-- PASO 1: Importar Link

export const revalidate = 300; // ISR: refresca cada 5 min

export default async function HomePage() {
  const posts = await getPosts(12);

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
        Latest Posts
      </h1>

      <ul style={{ display: 'grid', gap: '1rem' }}>
        {posts.map((p) => {
          // --- DEBUGGING ---
          // Vamos a imprimir el slug en el log del servidor (Vercel)
          // para asegurarnos de que no sea nulo o indefinido.
          console.log(`[Home Page] Rendering link, slug: /${p.slug}`);
          // --- FIN DEBUGGING ---

          return (
            <li key={p.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem' }}>
              
              {/* --- LA CORRECCIÓN ESTÁ AQUÍ --- */}
              {/* Reemplazamos <a> por <Link> para navegación de Next.js */}
              <Link href={`/${p.slug}`} style={{ fontSize: '1.125rem', color: '#2563eb', textDecoration: 'none' }}>
                {p.title}
              </Link>
              {/* --- FIN DE LA CORRECCIÓN --- */}

              {p.date && (
                <div style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
                  {new Date(p.date).toLocaleDateString()}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}

