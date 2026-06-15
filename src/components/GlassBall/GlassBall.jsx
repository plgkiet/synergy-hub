import "./GlassBall.css";
import logoBig from "@/assets/img/logobig.png";

export default function GlassBall({ style }) {
  return (
    <div className="glass-ball" style={style}>
      <img src={logoBig} alt="logo" />
    </div>
  );
}
