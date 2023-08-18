import { makeRequest } from "./makeRequest";

export const getPosts = () => makeRequest("/posts");

export const getPost = (id) => makeRequest(`/post/${id}`);
