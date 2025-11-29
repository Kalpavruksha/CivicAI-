import { motion } from "framer-motion";

export default function LoadingScanner() {
  return (
    <div className="fixed inset-0 bg-[#050810cc] backdrop-blur-sm flex items-center justify-center z-50">

      <div className="relative w-64 h-64">

        {/* Rotating neon ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-neon-blue shadow-neon"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner pulse */}
        <motion.div
          className="absolute inset-8 rounded-full border border-neon-purple shadow-neonPurple"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Scan line */}
        <motion.div
          className="absolute inset-x-0 h-1 bg-neon-blue"
          animate={{ y: ["0%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

      </div>

      <p className="text-neon-blue text-xl glow ml-8">AI Scanning…</p>
    </div>
  );
}