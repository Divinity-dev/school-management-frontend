"use client";

import { Children } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function AnimatedPublicSections({ children }) {
  const reduceMotion = useReducedMotion();

  return Children.toArray(children).map((child, index) => (
    <motion.div
      key={index}
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        delay: reduceMotion ? 0 : Math.min(index * 0.045, 0.18),
        ease: "easeOut",
      }}
    >
      {child}
    </motion.div>
  ));
}
