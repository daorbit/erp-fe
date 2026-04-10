import { motion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';

const variants: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
};

interface AnimateInProps {
  children: ReactNode;
  variant?: keyof typeof variants;
  delay?: number;
  duration?: number;
  className?: string;
}

export default function AnimateIn({ children, variant = 'fadeUp', delay = 0, duration = 0.4, className }: AnimateInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants[variant]}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Staggered container for lists/grids
export function StaggerContainer({ children, className, staggerDelay = 0.08 }: { children: ReactNode; className?: string; staggerDelay?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
