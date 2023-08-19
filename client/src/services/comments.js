import { makeRequest } from "./makeRequest";

export function createComment({ postId, message, parentId }) {
  return makeRequest(`/post/${postId}/comment`, {
    method: "POST",
    data: { message, parentId },
  });
}
