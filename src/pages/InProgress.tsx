import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function InProgress() {
  const { pathname } = useLocation();

  // Derive a human-readable module name from the URL path
  const label = pathname
    .split('/')
    .filter(Boolean)
    .map((s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(' / ');

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center text-center px-6"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Construction className="w-12 h-12 text-amber-500" />
          </div>
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          In Progress
        </h1>

        {label && (
          <p className="text-lg font-medium text-amber-600 dark:text-amber-400 mb-2">
            {label}
          </p>
        )}

        <p className="text-gray-500 dark:text-gray-400 max-w-md text-base">
          This module is currently under development. Check back soon!
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
              className="w-2.5 h-2.5 rounded-full bg-amber-500"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
