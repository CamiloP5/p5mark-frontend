import Link from 'next/link';
import { WPPost } from '@/types'; 

interface PostCardProps {
  post: WPPost;
}

/**
 * Componente que renderiza una tarjeta de post con un enlace dinámico al post.
 */
export default function PostCard({ post }: PostCardProps) {
  if (!post || !post.slug) {
    return null; // No renderizar si no hay post o slug
  }
  
  // *** CORRECCIÓN CRÍTICA: Nueva ruta dinámica /posts/[slug] ***
  const postUrl = `/posts/${post.slug}`; // <-- ¡Ruta actualizada!

  return (
    // Hemos comentado la etiqueta <Link> para mostrar el JSON directamente
    <div 
      className="block p-5 border border-gray-200 rounded-lg shadow-xl transition duration-200 ease-in-out bg-gray-50 border-red-500"
    >
      <article>
        <h2 className="text-xl font-semibold text-red-700 mb-2">
          DEBUGGING: Post Data
        </h2>
        
        {/* Mostrar el JSON de todo el objeto post con formato */}
        <pre className="whitespace-pre-wrap text-xs bg-red-50 p-3 rounded-md overflow-x-auto">
          {JSON.stringify(post, null, 2)}
        </pre>
        
        <p className="text-gray-600 mt-4">
            *** Esta es una vista de DEBUG ***
        </p>

      </article>
    </div>
    /*
    <Link 
      href={postUrl} 
      className="block p-5 border border-gray-200 rounded-lg hover:shadow-lg transition duration-200 ease-in-out bg-white"
    >
      <article>
        ... contenido original ...
      </article>
    </Link>
    */
  );
}
