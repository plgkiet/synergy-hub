import "./AboutPage.css";

import logo from "@/assets/img/logo/logo.png";
import hero2 from "@/assets/img/whiteLogo.png";

import GlassCard from "./components/GlassCard";
import GlassCircle from "@/components/GlassCard/GlassCircle";
import GlassButton from "./components/GlassButton";

import { BubbleBackground } from "@/components/ui/BubbleBackground";
import { useNavigate } from "react-router-dom";

import { useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const navigate = useNavigate();
  const container = useRef(null);
  useGSAP(
    () => {
      gsap.from(".about-hero__content", {
        opacity: 0,
        x: -80,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".about-logo-circle", {
        opacity: 0,
        x: 80,
        scale: 0.9,
        duration: 1,
        delay: 0.15,
        ease: "power3.out",
      });

      gsap.utils.toArray(".about-section").forEach((section) => {
        gsap.from(section, {
          y: 80,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",

          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      });

      gsap.from(".timeline-item", {
        opacity: 0,
        y: 60,
        stagger: 0.18,
        duration: 0.8,

        scrollTrigger: {
          trigger: ".timeline",
          start: "top 75%",
        },
      });

      gsap.from(".skill-card", {
        opacity: 0,
        y: 50,
        stagger: 0.08,

        scrollTrigger: {
          trigger: ".skills-grid",
          start: "top 75%",
        },
      });

      gsap.utils.toArray(".skill-fill").forEach((bar) => {
        gsap.to(bar, {
          width: bar.dataset.width,

          duration: 1.2,
          ease: "power2.out",

          scrollTrigger: {
            trigger: bar,
            start: "top 90%",
          },
        });
      });

      gsap.from(".tech-stack span", {
        opacity: 0,
        y: 25,
        stagger: 0.08,

        scrollTrigger: {
          trigger: ".tech-stack",
          start: "top 80%",
        },
      });

      gsap.from(".reference-grid > *", {
        opacity: 0,
        y: 40,
        stagger: 0.15,

        scrollTrigger: {
          trigger: ".reference-grid",
          start: "top 80%",
        },
      });

      gsap.fromTo(
        ".about-actions .about-glass-button",
        {
          opacity: 0,
          y: 20,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".about-actions",
            start: "top 90%",
          },
        },
      );
    },
    { scope: container },
  );
  return (
    <div className="about-page" ref={container}>
      <BubbleBackground interactive />

      <section className="about-hero">
        <div className="about-hero__content">
          <span className="about-label">
            Every candidate has a CV. This is ours.
          </span>

          <GlassCard className="company-profile-card">
            <div className="company-profile-header">
              <div>
                <div className="company-profile-tag">COMPANY PROFILE</div>
                <h2>Synergy Hub</h2>
              </div>

              <div className="company-status">Active</div>
            </div>

            <div className="company-profile-grid">
              <div className="profile-item">
                <span>Founded</span>
                <strong>2025</strong>
              </div>

              <div className="profile-item">
                <span>Headquarters</span>
                <strong>Binh Duong</strong>
              </div>

              <div className="profile-item">
                <span>Founder</span>
                <strong>
                  Le Chi Cuong, Pham Le Gia Kiet, Nguyen Xuan Huan
                </strong>
              </div>

              <div className="profile-item">
                <span>Industry</span>
                <strong>HR Technology</strong>
              </div>

              <div className="profile-item">
                <span>Platform</span>
                <strong>AI Recruitment</strong>
              </div>

              <div className="profile-item">
                <span>Mission</span>
                <strong>Better Hiring</strong>
              </div>
            </div>

            <div className="company-summary">
              Building modern talent infrastructure powered by AI, search, and
              recruitment intelligence.
            </div>
          </GlassCard>
        </div>

        <GlassCircle className="about-logo-circle">
          <img src={hero2} alt="Synergy Hub" />
        </GlassCircle>
      </section>

      <section className="about-section">
        <GlassCard className="about-card">
          <div className="about-section-title">Profile Summary</div>

          <p>
            Synergy Hub is an AI-powered recruitment and talent intelligence
            platform designed to help organizations collect CVs, evaluate
            candidates, discover hidden talent, and streamline hiring workflows.
          </p>

          <p>
            Our mission is to reduce hiring friction and connect people with
            opportunities through smarter technology.
          </p>
        </GlassCard>
      </section>

      <section className="about-section">
        <h2 className="section-heading">Work Experience</h2>

        <div className="timeline">
          <GlassCard className="timeline-item">
            <div className="timeline-year">2025</div>
            <h3>Platform Foundation</h3>
            <p>
              Built the core infrastructure for CV uploads, candidate storage,
              and role management.
            </p>
          </GlassCard>

          <GlassCard className="timeline-item">
            <div className="timeline-year">2025</div>
            <h3>AI Matching</h3>
            <p>
              Introduced AI-powered role prediction and candidate
              recommendations.
            </p>
          </GlassCard>

          <GlassCard className="timeline-item">
            <div className="timeline-year">Today</div>
            <h3>Talent Intelligence</h3>
            <p>
              Expanding search capabilities and building modern hiring
              experiences for organizations.
            </p>
          </GlassCard>
        </div>
      </section>

      <section className="about-section">
        <h2 className="section-heading">Skills</h2>

        <div className="skills-grid">
          {[
            ["AI Matching", "95%"],
            ["Semantic Search", "92%"],
            ["Recruitment Analytics", "90%"],
            ["Workflow Automation", "88%"],
            ["Talent Intelligence", "93%"],
            ["Candidate Management", "91%"],
          ].map(([name, score]) => (
            <GlassCard key={name} className="skill-card">
              <div className="skill-header">
                <span>{name}</span>
                <strong>{score}</strong>
              </div>

              <div className="skill-bar">
                <div className="skill-fill" data-width={score} />
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2 className="section-heading">Education</h2>

        <GlassCard className="about-card">
          <div className="tech-stack">
            <span>React</span>
            <span>.NET</span>
            <span>SignalR</span>
            <span>OpenAI</span>
            <span>Azure</span>
            <span>Vector Search</span>
            <span>MSSQL</span>
            <span>Cloud Infrastructure</span>
          </div>
        </GlassCard>
      </section>

      <section className="about-section">
        <h2 className="section-heading">References</h2>

        <div className="reference-grid">
          <GlassCard>
            <h3>For Candidates</h3>
            <p>
              Upload CVs and discover opportunities that match your strengths.
            </p>
          </GlassCard>

          <GlassCard>
            <h3>For Recruiters</h3>
            <p>
              Search candidates faster and make hiring decisions with
              confidence.
            </p>
          </GlassCard>

          <GlassCard>
            <h3>For Organizations</h3>
            <p>Build scalable recruitment workflows and talent pipelines.</p>
          </GlassCard>
        </div>
      </section>

      <section className="about-signature">
        <img src={logo} alt="Synergy Hub" />

        <h2>Thank you for reviewing our application.</h2>

        <p>
          Sincerely,
          <br />
          Synergy Hub Team
        </p>

        <div className="about-actions">
          <GlassButton onClick={() => navigate("/dashboard")}>
            ← Go to dashboard
          </GlassButton>
          <GlassButton onClick={() => navigate("/jobs")}>
            → View Jobs
          </GlassButton>
        </div>
      </section>
    </div>
  );
}
