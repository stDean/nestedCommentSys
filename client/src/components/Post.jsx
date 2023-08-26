import { usePost } from "../context/PostProvider";
import { useAsyncFn } from "../hooks/useAsync";
import { createComment } from "../services/comments";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

const Post = () => {
  const { post, rootComments, createLocalComment } = usePost();

  // using the useAsyncFn because i only want to execute the function when the form is submitted
  const {
    loading,
    error,
    execute: createCommentFn,
  } = useAsyncFn(createComment);

  // return the new comment and all previous comments
  const onCommentCreate = (message) => {
    return createCommentFn({ postId: post.id, message }).then(
      createLocalComment
    );
  };

  return (
    <>
      <h1>{post.title}</h1>
      <article>{post.body}</article>
      <h3 className="comments-title">Comments</h3>
      <section>
        <CommentForm
          loading={loading}
          error={error}
          onSubmit={onCommentCreate}
        />
        {rootComments !== null && rootComments?.length > 0 && (
          <div className="mt-4">
            <CommentList comments={rootComments} />
          </div>
        )}
      </section>
    </>
  );
};

export default Post;
