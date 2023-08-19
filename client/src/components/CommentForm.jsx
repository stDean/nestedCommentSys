import { useState } from "react";

export const CommentForm = ({
  loading,
  error,
  autoFocus = false,
  onSubmit,
  initialValue = ""
}) => {
  const [message, setMessage] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(message).then(() => setMessage(""));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="comment-form-row">
        <textarea
          autoFocus={autoFocus}
          value={message}
          className="message-input"
          onChange={({ target }) => setMessage(target.value)}
        />
        <button className="btn" disabled={loading} type="submit">
          {loading ? "loading" : "Post"}
        </button>
      </div>
      <div className="error-msg">{error}</div>
    </form>
  );
};
