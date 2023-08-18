import { Routes, Route } from "react-router-dom";

import { Post, PostLists } from "./components";
import { PostProvider } from "./context/PostProvider";

function App() {
  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<PostLists />} />
        <Route
          path="/post/:id"
          element={
            <PostProvider>
              <Post />
            </PostProvider>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
