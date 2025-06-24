import React from "react";
import Header from "../components/Header";
import BusinessCard from "../components/BusinessCard";
import ClassicCotton from "../assets/landingImages/ClassicCotton.png";
import PremiumCotton from "../assets/landingImages/PremiumCotton.png";
import PolyCottonBlend from "../assets/landingImages/PolyCottonBlend.jpeg";
import PolyCottonEveryDay from "../assets/landingImages/PolyCottonEveryday.jpeg";

const tshirtDesigns = [
  {
    name: "Cotton Classic Tee",
    image: ClassicCotton,
    description: "100% pure cotton for ultimate comfort and breathability.",
    category: "Cotton",
  },
  {
    name: "Cotton Premium Tee",
    image: PremiumCotton,
    description: "Soft, durable cotton with a premium finish.",
    category: "Cotton",
  },
  {
    name: "Poly Cotton Blend Tee",
    image: PolyCottonBlend,
    description: "A perfect blend of polyester and cotton for softness and durability.",
    category: "Poly Cotton",
  },
  {
    name: "Poly Cotton Everyday Tee",
    image: PolyCottonEveryDay,
    description: "Wrinkle-resistant and lightweight poly cotton for daily wear.",
    category: "Poly Cotton",
  },
  {
    name: "Sports Performance Tee",
    image: "/images/sports-performance.jpg",
    description: "Moisture-wicking fabric ideal for workouts and sports.",
    category: "Sports",
  },
  {
    name: "Athletic Mesh Tee",
    image: "/images/athletic-mesh.jpg",
    description: "Breathable mesh design for maximum airflow during activities.",
    category: "Sports",
  },
  {
    name: "Ethnic Print Tee",
    image: "/images/ethnic-print.jpg",
    description: "Traditional patterns with a modern twist.",
    category: "Ethnic",
  },
  {
    name: "Festive Ethnic Tee",
    image: "/images/festive-ethnic.jpg",
    description: "Celebrate culture with vibrant ethnic designs.",
    category: "Ethnic",
  },
  {
    name: "Event Special Tee",
    image: "/images/event-special.jpg",
    description: "Custom tees for events, parties, and celebrations.",
    category: "Event Based",
  },
  {
    name: "Occasion Tee",
    image: "/images/occasion.jpg",
    description: "Designed for special occasions and gatherings.",
    category: "Event Based",
  },
  {
    name: "Uniform Crew Tee",
    image: "/images/uniform-crew.jpg",
    description: "Perfect for teams, staff, and organizations.",
    category: "Uniform",
  },
  {
    name: "Corporate Uniform Tee",
    image: "/images/corporate-uniform.jpg",
    description: "Professional look for corporate and institutional use.",
    category: "Uniform",
  },
];

const Home = () => {
  return (
    <div
      style={{
        fontFamily: "Segoe UI, Arial, sans-serif",
        background: "#fafbfc",
        minHeight: "100vh",
        minWidth: "1230px",
      }}
    >
      <section
        style={{
          background: "linear-gradient(90deg,rgb(217, 233, 249) 60%,rgb(136, 187, 247) 100%)",
          padding: "3rem 0 2rem 0",
          textAlign: "center",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <h1
          style={{
            fontSize: 42,
            margin: 0,
            color: "#22223b",
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          KPJ T-Shirts
        </h1>
        <p
          style={{
            fontSize: 20,
            color: "#4a4e69",
            margin: "1rem auto",
            maxWidth: 600,
          }}
        >
          Elevate your everyday style with premium, comfortable, and unique
          T-shirts. Designed for everyone, made to last.
        </p>
        <a
          href="#designs"
          style={{
            display: "inline-block",
            marginTop: 24,
            padding: "12px 32px",
            background: "#22223b",
            color: "#fff",
            borderRadius: 24,
            fontWeight: 600,
            textDecoration: "none",
            fontSize: 18,
            boxShadow: "0 2px 8px #22223b22",
            transition: "background 0.2s",
          }}
        >
          Shop Our Designs
        </a>
      </section>

      <section
        id="designs"
        style={{ padding: "3rem 0", maxWidth: 1100, margin: "0 auto" }}
      >
        <h2
          style={{
            fontSize: 32,
            color: "#22223b",
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          Featured Designs
        </h2>
        <div
          style={{
            display: "flex",
            gap: "2.5rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {tshirtDesigns.map((design) => (
            <div
              key={design.name}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 24,
                width: 260,
                boxShadow: "0 2px 12px #22223b0a",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "box-shadow 0.2s",
              }}
            >
              <img
                src={design.image}
                alt={design.name}
                style={{
                  width: "100%",
                  height: 180,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginBottom: 16,
                  boxShadow: "0 1px 6px #22223b11",
                }}
              />
              <h4
                style={{
                  margin: "0 0 8px 0",
                  color: "#22223b",
                  fontWeight: 600,
                }}
              >
                {design.name}
              </h4>
              <p style={{ fontSize: 15, color: "#4a4e69", margin: 0 }}>
                {design.description}
              </p>
              <button
                style={{
                  marginTop: 18,
                  padding: "8px 20px",
                  background: "#4a4e69",
                  color: "#fff",
                  border: "none",
                  borderRadius: 20,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontSize: 15,
                  transition: "background 0.2s",
                }}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          background: "#22223b",
          color: "#fff",
          padding: "2.5rem 0",
          textAlign: "center",
        }}
      >
        <h3 style={{ fontSize: 26, marginBottom: 12 }}>Why Choose KPJ?</h3>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "0 auto",
            maxWidth: 700,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "2rem",
            fontSize: 17,
          }}
        >
          <li>✔️ Premium, soft cotton fabrics</li>
          <li>✔️ Unique, original designs</li>
          <li>✔️ Fast, reliable shipping</li>
          <li>✔️ Satisfaction guaranteed</li>
        </ul>
      </section>

      <footer
        style={{
          background: "#f8fafc",
          color: "#4a4e69",
          textAlign: "center",
          padding: "1.5rem 0 1rem 0",
          fontSize: 15,
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <strong>Contact us:</strong> info@kpjtshirts.com &nbsp;|&nbsp; (+91)
          8555909245 &nbsp;|&nbsp; IT Sez Rushikonda, Visakhapatnam
        </div>
        <div>
          © {new Date().getFullYear()} KPJ T-Shirts. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
