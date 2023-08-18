import { useParams } from "react-router-dom";
import { createContext, useContext, useMemo } from "react";

import { useAsync } from "../hooks/useAsync";
import { getPost } from "../services/posts";

const postContext = createContext(null);

export function PostProvider({ children }) {
  const { id } = useParams();
  const { loading, error, value: post } = useAsync(() => getPost(id), [id]);
  const commentsByParentId = useMemo(() => {
    if (post?.comments === null) return;
    const group = {};
    post.comments?.forEach((comment) => {
      group[comment.parentId] ||= [];
      group[comment.parentId].push(comment);
    });
    return group;
  }, [post?.comments]);

  function getReplies(parentId) {
    return commentsByParentId[parentId];
  }

  return (
    <postContext.Provider
      value={{
        post: { id, ...post },
        getReplies,
        rootComments: commentsByParentId[null],
      }}
    >
      {loading ? (
        <h1>loading...</h1>
      ) : error ? (
        <h1 className="error-msg">{error}</h1>
      ) : (
        children
      )}
    </postContext.Provider>
  );
}

export const usePost = () => useContext(postContext);
