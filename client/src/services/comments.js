import { makeRequest } from "./makeRequest";

export function createComment({ postId, message, parentId }) {
  return makeRequest(`/post/${postId}/comment`, {
    method: "POST",
    data: { message, parentId },
  });
}

export function updateComment({ postId, message, id }) {
  return makeRequest(`/post/${postId}/comment/${id}`, {
    method: "PUT",
    data: { message },
  });
}

export function deleteComment({ postId, id }) {
  return makeRequest(`/post/${postId}/comment/${id}`, {
    method: "DELETE",
  });
}

export function toggleCommentLikes({ id, postId }) {
  return makeRequest(`/post/${postId}/comment/${id}/toggleLike`, {
    method: "POST",
  });
}
