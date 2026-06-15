import { useEffect, useState } from "react";
import GlassBall from "./GlassBall/GlassBall";

export default function GlassBallRain() {
  const [balls, setBalls] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: 7 }).map((_, i) => ({
      id: i,
      left: Math.random() * 80 + 5,
      size: 30 + Math.random() * 20,
      delay: i * 0.4,
      duration: 4 + Math.random() * 2,
    }));

    setBalls(generated);

    const timer = setTimeout(() => {
      setBalls([]);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="glass-rain">
      {balls.map((ball) => (
        <GlassBall
          key={ball.id}
          style={{
            left: `${ball.left}%`,
            width: ball.size,
            height: ball.size,
            animationDelay: `${ball.delay}s`,
            animationDuration: `${ball.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
