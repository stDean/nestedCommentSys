import { FaEdit, FaHeart, FaReply, FaTrash } from "react-icons/fa";

import { IconButton } from "./IconButton";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function Comment({ id, message, user, createdAt }) {
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
    </>
  );
}
