import { useState } from "react";
import { FaEdit, FaHeart, FaRegHeart, FaReply, FaTrash } from "react-icons/fa";

import { IconButton } from "./IconButton";
import { CommentList } from "./CommentList";
import { usePost } from "../context/PostProvider";
import { CommentForm } from "./CommentForm";
import { useAsyncFn } from "../hooks/useAsync";
import {
  createComment,
  deleteComment,
  toggleCommentLikes,
  updateComment,
} from "../services/comments";
import { useUser } from "../hooks/useUser";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function Comment({
  id,
  message,
  user,
  createdAt,
  likeCount,
  likedByMe,
}) {
  const {
    post,
    getReplies,
    createLocalComment,
    updateLocalComment,
    deleteLocalComment,
    toggleLocalCommentLike,
  } = usePost();
  const currentUser = useUser();
  const childComments = getReplies(id);
  const [areChildrenHidden, setAreChildrenHidden] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const createCommentFn = useAsyncFn(createComment);
  const updateCommentFn = useAsyncFn(updateComment);
  const deleteCommentFn = useAsyncFn(deleteComment);
  const toggleCommentLikeFn = useAsyncFn(toggleCommentLikes);

  // replying a post is always a child of one of a parent comment.
  const onCommentReply = (message) => {
    return createCommentFn
      .execute({ postId: post.id, message, parentId: id })
      .then((comment) => {
        setIsReplying(false);
        createLocalComment(comment);
      });
  };

  const onCommentUpdate = (message) => {
    return updateCommentFn
      .execute({ postId: post.id, message, id })
      .then((comment) => {
        setIsEditing(false);
        updateLocalComment(id, comment.message);
      });
  };

  const onCommentDelete = () => {
    return deleteCommentFn.execute({ postId: post.id, id }).then((comment) => {
      setIsEditing(false);
      deleteLocalComment(comment.id);
    });
  };

  const onToggleCommentLike = () => {
    return toggleCommentLikeFn
      .execute({ postId: post.id, id })
      .then(({ addLike }) => toggleLocalCommentLike(id, addLike));
  };

  return (
    <>
      <div className="comment">
        <div className="header">
          <span>{user.name}</span>
          <span>{dateFormatter.format(Date.parse(createdAt))}</span>
        </div>
        
        {isEditing ? (
          <CommentForm
            autoFocus
            loading={updateCommentFn.loading}
            error={updateCommentFn.error}
            onSubmit={onCommentUpdate}
            initialValue={message}
          />
        ) : (
          <div className="message">{message}</div>
        )}
        <div className="footer">
          <IconButton
            onClick={onToggleCommentLike}
            disabled={toggleCommentLikeFn.loading}
            Icon={likedByMe ? FaHeart : FaRegHeart}
            aria-label={likedByMe ? "unlike" : "like"}
          >
            {likeCount}
          </IconButton>
          <IconButton
            onClick={() => setIsReplying((isReplying) => !isReplying)}
            isActive={isReplying}
            Icon={FaReply}
            aria-label={isReplying ? "cancel reply" : "reply"}
          />

          {user.id === currentUser.id && (
            <>
              <IconButton
                onClick={() => setIsEditing((isEditing) => !isEditing)}
                isActive={isEditing}
                Icon={FaEdit}
                aria-label={isEditing ? "cancel edit" : "edit"}
              />
              <IconButton
                onClick={onCommentDelete}
                Icon={FaTrash}
                aria-label="delete"
                color="danger"
                disabled={deleteCommentFn.loading}
              />
            </>
          )}
        </div>

        {deleteCommentFn.error && (
          <div className="error-msg mt-1">{deleteCommentFn.error}</div>
        )}
      </div>
      {isReplying && (
        <div className="mt-1 ml-3">
          <CommentForm
            autoFocus
            onSubmit={onCommentReply}
            loading={createCommentFn.loading}
            error={createCommentFn.error}
          />
        </div>
      )}

      {childComments?.length > 0 && (
        <>
          <div
            className={`nested-comments-stack ${
              areChildrenHidden ? "hide" : ""
            }`}
          >
            <button
              aria-label="hide replies"
              className="collapse-line"
              onClick={() => setAreChildrenHidden(true)}
            />
            <div className="nested-comments">
              <CommentList comments={childComments} />
            </div>
          </div>
          <button
            className={`btn mt-1 ${!areChildrenHidden ? "hide" : ""}`}
            onClick={() => setAreChildrenHidden(false)}
          >
            Show Replies
          </button>
        </>
      )}
    </>
  );
}
