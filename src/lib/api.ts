import { fetchGraphQL } from './graphql';

export async function getPosts() {
  const query = `
    query AllPosts {
      posts(first: 10, where: { status: PUBLISH }) {
        nodes {
          id
          slug
          title
          date
          excerpt
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  `;
  const data = await fetchGraphQL<{ posts: { nodes: any[] } }>(query);
  return data.posts.nodes;
}
