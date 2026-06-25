import "./ContactPage.css";
import GlassCard from "../AboutPage/components/GlassCard";
import GlassButton from "../AboutPage/components/GlassButton";
import GlassBallRain from "./components/GlassBallRain";
// import { BubbleBackground } from "@/components/ui/BubbleBackground";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import LenisProvider from "@/components/ui/LenisProvider";

gsap.registerPlugin(ScrollTrigger);

export default function ContactPage() {
  const navigate = useNavigate();
  const container = useRef(null);
  useGSAP(
    () => {
      gsap.from(".contact-hero > *", {
        y: 35,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".contact-card", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".contact-card",
          start: "top 80%",
        },
      });

      gsap.from(".contact-card-header > *", {
        x: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".contact-card",
          start: "top 80%",
        },
      });

      gsap.from(".contact-item", {
        y: 25,
        opacity: 0,
        stagger: 0.08,
        duration: 0.55,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".contact-grid",
          start: "top 80%",
        },
      });

      gsap.from(".contact-summary", {
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".contact-summary",
          start: "top 90%",
        },
      });

      // gsap.fromTo(
      //   ".contact-actions .about-glass-button",
      //   {
      //     opacity: 0,
      //     y: 25,
      //     x: (_, i) => (i === 0 ? -20 : 20),
      //   },
      //   {
      //     opacity: 1,
      //     y: 0,
      //     x: 0,
      //     duration: 0.7,
      //     stagger: 0.15,
      //     ease: "power3.out",
      //     scrollTrigger: {
      //       trigger: ".contact-actions",
      //       start: "top 90%",
      //       toggleActions: "play none none none",
      //     },
      //   },
      // );
    },
    { scope: container },
  );
  return (
    <LenisProvider>
      <div className="contact-page" ref={container}>
        {" "}
        <GlassBallRain />
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
              We are always open to discussing recruitment technology,
              AI-powered hiring solutions, partnerships, and talent intelligence
              initiatives.
            </div>
          </GlassCard>
        </section>
        <section className="contact-actions">
          <GlassButton onClick={() => navigate("/dashboard")}>
            ← Go to dashboard
          </GlassButton>
          <GlassButton onClick={() => navigate("/about")}>
            → About Us
          </GlassButton>
        </section>
      </div>
    </LenisProvider>
  );
}
