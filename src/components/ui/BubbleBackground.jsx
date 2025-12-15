import React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function BubbleBackground({
  className = "",
  children,
  interactive = false,
  colors = {
    first: "22,60,152",
    second: "13,177,75",
    third: "46,196,182",
    fourth: "30,165,224",
    fifth: "22,96,210",
    sixth: "48,209,138",
  },
}) {
  const containerRef = React.useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  React.useEffect(() => {
    if (!interactive) return;
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mouseX.set(e.clientX - cx);
      mouseY.set(e.clientY - cy);
    };

    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [interactive, mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className={`bubble-bg ${className}`}
      style={{
        ["--first-color"]: colors.first,
        ["--second-color"]: colors.second,
        ["--third-color"]: colors.third,
        ["--fourth-color"]: colors.fourth,
        ["--fifth-color"]: colors.fifth,
        ["--sixth-color"]: colors.sixth,
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="bubble-bg__defs">
        <defs>
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className="bubble-bg__layer">
        <motion.div
          className="bubble bubble--1"
          animate={{ y: [-50, 50, -50] }}
          transition={{ duration: 30, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          className="bubble-rot bubble-rot--2"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        >
          <div className="bubble bubble--2" />
        </motion.div>
        <motion.div
          className="bubble-rot bubble-rot--3"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        >
          <div className="bubble bubble--3" />
        </motion.div>
        <motion.div
          className="bubble bubble--4"
          animate={{ x: [-50, 50, -50] }}
          transition={{ duration: 40, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          className="bubble-rot bubble-rot--5"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        >
          <div className="bubble bubble--5" />
        </motion.div>

        {interactive && (
          <motion.div
            className="bubble bubble--6"
            style={{ x: springX, y: springY }}
          />
        )}
      </div>

      {children}
    </div>
  );
}
