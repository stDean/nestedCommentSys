import { useParams } from "react-router-dom";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { useAsync } from "../hooks/useAsync";
import { getPost } from "../services/posts";

const postContext = createContext(null);

export function PostProvider({ children }) {
  const { id } = useParams();
  const { loading, error, value: post } = useAsync(() => getPost(id), [id]);
  const [comments, setComments] = useState([]);

  // setting a local array of comments and update it when comment changes.
  useEffect(() => {
    if (post?.comments === null) return;
    setComments(post.comments);
  }, [post?.comments]);

  const commentsByParentId = useMemo(() => {
    const group = {};
    comments?.forEach((comment) => {
      // if group[comment.parentId] does not exist create an empty array else don't do any thing
      group[comment.parentId] ||= [];
      group[comment.parentId].push(comment);
    });
    return group;
  }, [comments]);

  // commentByParentId[null] === root comments
  // this gets all replies to the parent comment
  function getReplies(parentId) {
    return commentsByParentId[parentId];
  }

  function createLocalComment(comment) {
    setComments((prevComment) => {
      return [comment, ...prevComment];
    });
  }

  // replace the message with the new message in the comments object
  function updateLocalComment(id, message) {
    setComments((prevComment) => {
      return prevComment.map((comment) => {
        if (comment.id !== id) {
          return comment;
        }
        return { ...comment, message };
      });
    });
  }

  function deleteLocalComment(id) {
    setComments((prevComment) => {
      return prevComment.filter((comment) => comment.id !== id);
    });
  }

  function toggleLocalCommentLike(id, addLike) {
    setComments((prevComment) => {
      return prevComment.map((comment) => {
        if (id === comment.id) {
          if (addLike) {
            return {
              ...comment,
              likeCount: comment.likeCount + 1,
              likedByMe: true,
            };
          } else {
            return {
              ...comment,
              likeCount: comment.likeCount - 1,
              likedByMe: false,
            };
          }
        } else {
          return comment;
        }
      });
    });
  }

  return (
    <postContext.Provider
      value={{
        post: { id, ...post },
        getReplies,
        rootComments: commentsByParentId[null],
        createLocalComment,
        updateLocalComment,
        deleteLocalComment,
        toggleLocalCommentLike,
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
