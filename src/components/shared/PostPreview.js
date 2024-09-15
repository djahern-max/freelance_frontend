const PostsPreview = ({ posts }) => (
  <div className="posts-preview">
    {posts.map((post) => (
      <div key={post.id} className="post">
        <h3>{post.title}</h3>
        <p>{post.content.slice(0, 100)}...</p>
        <button>Join the Conversation</button>
      </div>
    ))}
  </div>
);
export default PostsPreview;
