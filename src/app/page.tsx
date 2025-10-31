import { getPosts } from '@/lib/api';
import PostCard from '@/components/PostCard'; // Importamos el componente PostCard

export const revalidate = 300; // ISR: refresca cada 5 min

export default async function HomePage() {
  const posts = await getPosts(12);

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
        Últimas Publicaciones
      </h1>

      {posts.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280' }}>
          No se encontraron publicaciones.
        </p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {posts.map((p) => (
            // Usamos el componente PostCard para cada publicación
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </main>
  );
}
