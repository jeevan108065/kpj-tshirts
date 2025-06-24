import { useEffect } from "react";
import kpjLogo from "../assets/kpjLogo.svg";

// Simple fade-in animation using Intersection Observer
const useScrollFadeIn = () => {
  useEffect(() => {
    const elements = document.querySelectorAll(".fade-in");
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.2 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);
};

const About = () => {
  useScrollFadeIn();

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: 800,
        margin: "0 auto",
        fontFamily: "Inter, Arial, sans-serif",
        background:
          "linear-gradient(321deg, rgb(234 245 255) 0%, rgb(51 147 224) 100%)",
        borderRadius: 18,
        boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
        width: "95vw",
      }}
    >
      <style>
        {`
          @media (max-width: 600px) {
            .about-title {
              font-size: 1.7rem !important;
            }
            .about-list {
              font-size: 1rem !important;
              padding-left: 0.7rem !important;
            }
            .about-contact {
              font-size: 1rem !important;
            }
            .fade-in {
              font-size: 1rem !important;
            }
            img[alt="KPJ Logo"] {
              height: 48px !important;
              margin-bottom: 12px !important;
            }
            div[style*="padding: 2rem"] {
              padding: 1rem !important;
            }
          }
          .fade-in {
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 0.9s cubic-bezier(.4,0,.2,1), transform 0.9s cubic-bezier(.4,0,.2,1);
          }
          .fade-in.visible {
            opacity: 1;
            transform: none;
          }
          .about-title {
            font-size: 2.5rem;
            font-weight: 800;
            letter-spacing: -1px;
            background: linear-gradient(90deg, #6366f1 30%, #ec4899 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: slideIn 1.2s cubic-bezier(.4,0,.2,1);
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(-40px);}
            to { opacity: 1; transform: none;}
          }
          .about-highlight {
            background: linear-gradient(90deg, #fbbf24 30%, #f472b6 100%);
            border-radius: 0.4em;
            padding: 0.1em 0.4em;
            color: #fff;
            font-weight: 700;
            margin: 0 0.2em;
          }
          .about-contact a {
            color: #6366f1;
            font-weight: 600;
            text-decoration: none;
            transition: color 0.2s;
          }
          .about-contact a:hover {
            color: #ec4899;
          }
          .about-list {
            margin: 2rem 0 1.5rem 0;
            padding-left: 1.2rem;
            font-size: 1.1rem;
          }
        `}
      </style>
      <img
        src={kpjLogo}
        alt="KPJ Logo"
        style={{
          height: 70,
          marginBottom: 24,
          filter: "drop-shadow(0 2px 8px #6366f133)",
          animation: "slideIn 1.2s cubic-bezier(.4,0,.2,1)",
        }}
        className="fade-in"
      />
      <h2 className="about-title fade-in" style={{ marginBottom: 12 }}>
        KPJ T-Shirts{" "}
        <span role="img" aria-label="t-shirt">
          👕
        </span>
      </h2>
      <h3
        className="fade-in"
        style={{ fontWeight: 600, color: "#6366f1", marginBottom: 18 }}
      >
        Sublimation &amp; DTF Printing Experts
      </h3>
      <p className="fade-in" style={{ fontSize: "1.15rem", lineHeight: 1.7 }}>
        <span className="about-highlight">Elite Custom Apparel</span> for
        everyone. At <strong>KPJ T-Shirts</strong>, we blend{" "}
        <span className="about-highlight">creativity</span>,{" "}
        <span className="about-highlight">quality</span>, and{" "}
        <span className="about-highlight">speed</span> to deliver premium custom
        garments that make you stand out.
      </p>
      <ul className="about-list fade-in">
        <li>All types of t-shirts, kurtas, tank tops &amp; more</li>
        <li>
          Exclusive <span className="about-highlight">sublimation</span> &amp;{" "}
          <span className="about-highlight">DTF</span> prints
        </li>
        <li>Custom designs for individuals, teams, events, and businesses</li>
        <li>Bulk orders &amp; single pieces—no minimums</li>
        <li>Vibrant, long-lasting prints using the latest technology</li>
        <li>Lightning-fast turnaround &amp; reliable service</li>
      </ul>
      <p className="fade-in" style={{ fontSize: "1.1rem", marginBottom: 0 }}>
        <strong>Why choose us?</strong> <br />
        <span style={{ color: "#f59e42", fontWeight: 600 }}>
          • 100% Satisfaction Guarantee
        </span>{" "}
        <br />
        <span style={{ color: "#6366f1", fontWeight: 600 }}>
          • Personalized support from design to delivery
        </span>{" "}
        <br />
        <span style={{ color: "#ec4899", fontWeight: 600 }}>
          • Trusted by hundreds of happy customers
        </span>
      </p>
      <div
        className="about-contact fade-in"
        style={{ margin: "2rem 0 1rem 0", fontSize: "1.2rem" }}
      >
        <strong>Contact us today:</strong>
        <br />
        📞 <a href="tel:8074175884">80741 75884</a> |{" "}
        <a href="tel:8555909245">85559 09245</a>
      </div>
      <p
        className="fade-in"
        style={{ fontStyle: "italic", color: "#64748b", fontSize: "1.1rem" }}
      >
        KPJ T-Shirts – Where your ideas meet fabric!{" "}
        <span role="img" aria-label="spark">
          💥
        </span>
      </p>
    </div>
  );
};

export default About;
