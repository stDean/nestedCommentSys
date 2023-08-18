import { makeRequest } from "./makeRequest";

export const getPosts = () => makeRequest("/posts");
