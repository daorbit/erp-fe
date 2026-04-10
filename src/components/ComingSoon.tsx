import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import type { ReactNode } from 'react';

interface ComingSoonProps {
  children: ReactNode;
  enabled?: boolean;
  moduleName?: string;
}

export default function ComingSoon({ children, enabled = true, moduleName }: ComingSoonProps) {
  if (!enabled) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center text-center px-6"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-[var(--color-primary,#4f46e5)]/10 flex items-center justify-center">
            <Rocket className="w-12 h-12 text-[var(--color-primary,#4f46e5)]" />
          </div>
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          Coming Soon
        </h1>

        {moduleName && (
          <p className="text-lg font-medium text-[var(--color-primary,#4f46e5)] mb-2">
            {moduleName}
          </p>
        )}

        <p className="text-gray-500 dark:text-gray-400 max-w-md text-base">
          We're working hard to bring this module to you. Stay tuned for updates!
        </p>

        <motion.div
          className="mt-8 flex gap-1.5"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary,#4f46e5)]"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
