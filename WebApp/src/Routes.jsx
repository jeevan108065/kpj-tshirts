import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";

const AppRoutes = () => (
  <Routes>
    <Route path="/kpj-tshirts/" element={<Home />} />
    <Route path="/kpj-tshirts/about" element={<About />} />
    <Route path="/kpj-tshirts/contact" element={<Contact />} />
    <Route path="*" element={<Home />} />
  </Routes>
);

export default AppRoutes;