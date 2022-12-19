import { React } from "react";
import { BrowserRouter } from "react-router-dom";
import { Route, Routes } from "react-router";

import Home from "./Home";
import Playlists from "./Playlists";
import PageNotFound from "./PageNotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
