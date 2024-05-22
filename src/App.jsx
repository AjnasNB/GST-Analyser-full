import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Pdf_Upload from "./Pages/Pdf_Upload/Pdf_Upload";

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Pdf_Upload />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
