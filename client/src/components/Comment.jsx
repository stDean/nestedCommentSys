import { useState } from "react";
import { FaEdit, FaHeart, FaReply, FaTrash } from "react-icons/fa";

import { IconButton } from "./IconButton";
import { CommentList } from "./CommentList";
import { usePost } from "../context/PostProvider";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function Comment({ id, message, user, createdAt }) {
  const { getReplies } = usePost();
  const childComments = getReplies(id);
  const [areChildrenHidden, setAreChildrenHidden] = useState(false);

  return (
    <>
      <div className="comment">
        <div className="header">
          <span>{user.name}</span>
          <span>{dateFormatter.format(Date.parse(createdAt))}</span>
        </div>
        <div className="message">{message}</div>
        <div className="footer">
          <IconButton Icon={FaHeart} aria-label="like">
            2
          </IconButton>
          <IconButton Icon={FaReply} aria-label="reply" />
          <IconButton Icon={FaEdit} aria-label="edit" />
          <IconButton Icon={FaTrash} aria-label="delete" color="danger" />
        </div>
      </div>

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
