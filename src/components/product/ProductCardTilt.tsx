"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, type MouseEvent, type ReactNode } from "react";

type ProductCardTiltProps = {
  children: ReactNode;
  className?: string;
};

const TILT = 10;

/** 3D-наклон карточки за курсором; при reduced-motion — статичный блок. */
export function ProductCardTilt({ children, className = "" }: ProductCardTiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [TILT, -TILT]), {
    stiffness: 220,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-TILT, TILT]), {
    stiffness: 220,
    damping: 22,
  });

  const glareX = useTransform(x, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(y, [-0.5, 0.5], [0, 100]);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgb(255 255 255 / 0.28), transparent 55%)`;

  function onMove(event: MouseEvent<HTMLDivElement>) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className="[perspective:1000px]">
      <motion.div
        ref={ref}
        className={`relative transform-gpu will-change-transform ${className}`}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <div style={{ transform: "translateZ(0)" }}>{children}</div>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 mix-blend-soft-light transition-opacity duration-200 group-hover/tilt:opacity-100"
          style={{ background: glareBackground }}
        />
      </motion.div>
    </div>
  );
}
