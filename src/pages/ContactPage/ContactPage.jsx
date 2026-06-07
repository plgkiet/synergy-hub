import "./ContactPage.css";

import GlassCard from "../AboutPage/components/GlassCard";
import GlassButton from "../AboutPage/components/GlassButton";

// import { BubbleBackground } from "@/components/ui/BubbleBackground";
import { useNavigate } from "react-router-dom";

export default function ContactPage() {
  const navigate = useNavigate();

  return (
    <div className="contact-page">
      {/* <BubbleBackground interactive /> */}

      <section className="contact-hero">
        <span className="contact-label">REFERENCE CONTACT</span>

        <h1>
          Let's <span>Connect</span>
        </h1>

        <p>
          Interested in Synergy Hub? Reach out and let's discuss how we can
          build better hiring experiences together.
        </p>
      </section>

      <section className="contact-section">
        <GlassCard className="contact-card">
          <div className="contact-card-header">
            <h2>Company Reference</h2>

            <div className="contact-status">Available for Collaboration</div>
          </div>

          <div className="contact-grid">
            <div className="contact-item">
              <span>Company</span>
              <strong>Synergy Hub</strong>
            </div>

            <div className="contact-item">
              <span>Email</span>
              <strong>contact@synergyhub.ai</strong>
            </div>

            <div className="contact-item">
              <span>Phone</span>
              <strong>(+84) xxx xxx xxx</strong>
            </div>

            <div className="contact-item">
              <span>Website</span>
              <strong>www.synergyhub.ai</strong>
            </div>

            <div className="contact-item">
              <span>Address</span>
              <strong>
                81 Nam Ky Khoi Nghia
                <br />
                Ho Chi Minh City
              </strong>
            </div>

            <div className="contact-item">
              <span>Availability</span>
              <strong>
                Monday - Friday
                <br />
                09:00 - 18:00
              </strong>
            </div>
          </div>

          <div className="contact-summary">
            We are always open to discussing recruitment technology, AI-powered
            hiring solutions, partnerships, and talent intelligence initiatives.
          </div>
        </GlassCard>
      </section>

      <section className="contact-actions">
        <GlassButton onClick={() => navigate("/dashboard")}>
          ← Go to dashboard
        </GlassButton>
        <GlassButton onClick={() => navigate("/about")}>→ About Us</GlassButton>
      </section>
    </div>
  );
}
