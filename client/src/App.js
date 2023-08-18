import { Routes, Route } from "react-router-dom";

import { PostLists } from "./components";

function App() {
  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<PostLists />} />
        <Route path="/post/:id" element={<h1>Single Post</h1>} />
      </Routes>
    </div>
  );
}

export default App;
