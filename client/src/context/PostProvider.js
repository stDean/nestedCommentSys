import { useParams } from "react-router-dom";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { useAsync } from "../hooks/useAsync";
import { getPost } from "../services/posts";

const postContext = createContext(null);

export function PostProvider({ children }) {
  const { id } = useParams();
  const { loading, error, value: post } = useAsync(() => getPost(id), [id]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (post?.comments === null) return;
    setComments(post.comments);
  }, [post?.comments]);

  const commentsByParentId = useMemo(() => {
    const group = {};
    comments?.forEach((comment) => {
      group[comment.parentId] ||= [];
      group[comment.parentId].push(comment);
    });
    return group;
  }, [comments]);

  function getReplies(parentId) {
    return commentsByParentId[parentId];
  }

  function createLocalComment(comment) {
    setComments((prevComment) => {
      return [comment, ...prevComment];
    });
  }

  return (
    <postContext.Provider
      value={{
        post: { id, ...post },
        getReplies,
        rootComments: commentsByParentId[null],
        createLocalComment,
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
