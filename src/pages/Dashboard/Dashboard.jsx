import "./Dashboard.css";
import GlassPill from "@/components/GlassCard/GlassPill";
import GlassHeroCard from "@/components/GlassCard/GlassHeroCard";
import GlassButton from "@/components/GlassCard/GlassButton";
import GlassCard from "@/components/GlassCard/GlassCard";
import logo from "@/assets/img/logo/logo.png";
import hero from "@/assets/img/hero.png";
import hero2 from "@/assets/img/hero123.png";
import { useNavigate } from "react-router-dom";
import { authStorage } from "@/api/authStorage";
import { logout as logoutApi } from "@/api/auth";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = authStorage.getUser();

  return (
    <div className="sh-root">
      <header className="sh-nav">
        <div className="sh-nav-left">
          <GlassPill className="sh-logo-pill">
            <img src={logo} alt="Synergy Hub" />
          </GlassPill>
        </div>

        <nav className="sh-nav-center">
          <GlassPill className="sh-nav-glass">
            <button onClick={() => navigate("/upload")}>Upload</button>
            <button onClick={() => navigate("/search")}>Search</button>
            <button>About Us</button>
            <button>Contact Us</button>
          </GlassPill>
        </nav>

        <div className="sh-nav-right">
          <GlassPill className="sh-nav-auth">
            <span className="user-greeting">
              Hi, {user?.username || "User"}
            </span>

            <GlassButton
              onClick={() => {
                logoutApi();
                navigate("/login", { replace: true });
              }}
            >
              Log out
            </GlassButton>
          </GlassPill>
        </div>
      </header>

      <section className="sh-hero">
        <div className="sh-hero-left">
          <h1>
            Talent infrastructure <br />
            <span>for modern businesses</span>
          </h1>
          <p className="sh-hero-text">
            Millions of recruiters and companies use Synergy Hub to collect CVs,
            filter candidates, streamline hiring workflows, and ultimately build
            stronger teams.
          </p>
          <button className="sh-hero-cta" onClick={() => navigate("/search")}>
            Get started →
          </button>
        </div>

        <div className="sh-hero-right">
          <GlassHeroCard className="sh-hero-card">
            <img src={hero} alt="Dashboard illustration" />
          </GlassHeroCard>
        </div>
      </section>

      <section className="sh-band">
        <div className="sh-band-content">
          <h2 className="sh-band-title">
            High-quality talent, matched to
            <br />
            your needs
          </h2>

          <p className="sh-band-text">
            Synergy Hub is a recruitment and talent-matching platform that helps
            companies collect CVs, organize candidate profiles, and identify the
            right people with accuracy and speed. We empower teams to simplify
            hiring and focus on what matters most—building great organizations.
          </p>

          <button className="sh-band-cta" onClick={() => navigate("/upload")}>
            Upload your CVs →
          </button>
        </div>

        <div className="sh-band-visual">
          <img className="sh-band-hero" src={hero2} alt="Synergy Hub brand" />
        </div>
      </section>

      <section className="sh-footer-cta">
        <div className="sh-footer-inner">
          <div className="sh-footer-brand">
            <div className="sh-footer-logo-row">
              <img src={logo} alt="Synergy Hub" />
            </div>
            <p className="sh-footer-tagline">
              Experience the next generation
              <br />
              of CVs analytics.
            </p>
          </div>

          <div className="sh-footer-columns">
            <div className="sh-footer-col">
              <h4 className="sh-footer-col-title">Platform</h4>
              <button className="sh-footer-link">Features</button>
              <button className="sh-footer-link">Pricing</button>
              <button className="sh-footer-link">Community</button>
              <button className="sh-footer-link">Contact Us</button>
            </div>

            <div className="sh-footer-col">
              <h4 className="sh-footer-col-title">Legals</h4>
              <button className="sh-footer-link">Terms of Services</button>
              <button className="sh-footer-link">Privacy Policy</button>
            </div>

            <div className="sh-footer-col">
              <h4 className="sh-footer-col-title">SH for</h4>
              <button className="sh-footer-link">Agencies</button>
              <button className="sh-footer-link">Startups</button>
            </div>
          </div>

          <div className="sh-footer-contact">
            <GlassCard className="sh-footer-card">
              <h3 className="sh-footer-card-title">Get in touch</h3>
              <p className="sh-footer-card-line">
                81 Nam Ky Khoi Nghia Street,
              </p>
              <p className="sh-footer-card-line">Binh Duong Ward,</p>
              <p className="sh-footer-card-line">Ho Chi Minh City</p>
            </GlassCard>
          </div>
        </div>

        <div className="sh-footer-bottom">
          <span className="sh-footer-copy">
            ©2025 Synergy Hub. All rights reserved.
          </span>

          <div className="sh-footer-social">
            <i className="fa-brands fa-instagram" />
            <i className="fa-brands fa-youtube" />
            <i className="fa-brands fa-linkedin-in" />
          </div>
        </div>
      </section>
    </div>
  );
}
