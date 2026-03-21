import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import Quote from "./pages/Quote";

const AppRoutes = () => (
  <Routes>
    <Route path="/kpj-garments/" element={<Home />} />
    <Route path="/kpj-garments/products/:categoryId" element={<Products />} />
    <Route path="/kpj-garments/about" element={<About />} />
    <Route path="/kpj-garments/contact" element={<Contact />} />
    <Route path="/kpj-garments/quote" element={<Quote />} />
    <Route path="*" element={<Home />} />
  </Routes>
);

export default AppRoutes;
