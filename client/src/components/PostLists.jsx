import { Link } from "react-router-dom";

import { getPosts } from "../services/posts";
import { useAsync } from "../hooks/useAsync";

const PostLists = () => {
  const { loading, error, value: posts } = useAsync(getPosts);

  if (loading) return <h1>loading...</h1>;
  if (error) return <h1 className="error-msg">{error}</h1>;

  return (
    <>
      {posts.map(({ id, title }) => (
        <h1 key={id}>
          <Link to={`/post/${id}`}>{title}</Link>
        </h1>
      ))}
    </>
  );
};

export default PostLists;
