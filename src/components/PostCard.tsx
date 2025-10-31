import Link from 'next/link';
import { WPPost } from '@/types'; // Importamos el tipo centralizado

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
  
  // La ruta debe coincidir con la estructura de directorios: /[slug]
  // Si tu post tiene un slug "mi-primer-post", la URL será /mi-primer-post
  const postUrl = `/${post.slug}`;

  return (
    <Link 
      href={postUrl} 
      className="block p-5 border border-gray-200 rounded-lg hover:shadow-lg transition duration-200 ease-in-out bg-white"
    >
      <article>
        <h2 className="text-xl font-semibold text-gray-800 mb-2 hover:text-blue-600">
          {post.title}
        </h2>
        {post.date && (
          <p className="text-sm text-gray-500 mb-3">
            Publicado el: {new Date(post.date).toLocaleDateString()}
          </p>
        )}
        
        {post.featuredImage?.node?.sourceUrl && (
          <img
            src={post.featuredImage.node.sourceUrl}
            alt={post.featuredImage.node.altText || post.title}
            className="w-full h-48 object-cover rounded-md mb-4"
          />
        )}
        
        {/* Aquí podrías mostrar un extracto, si tu GraphQL lo soporta */}
        <p className="text-gray-600">
            Click para leer más...
        </p>

      </article>
    </Link>
  );
}
