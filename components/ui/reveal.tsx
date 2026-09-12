"use client";

import clsx from "clsx";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

type RevealVariant = "up" | "fade" | "left" | "right" | "scale";

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Stagger delay in milliseconds */
  delay?: number;
  variant?: RevealVariant;
  once?: boolean;
  style?: CSSProperties;
};

export function Reveal({
  children,
  className,
  as: Tag = "div",
  delay = 0,
  variant = "up",
  once = true,
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.06, rootMargin: "40px 0px -4% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      className={clsx(
        "reveal",
        `reveal-${variant}`,
        visible && "reveal-visible",
        className,
      )}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}
