import React, { useState } from "react";
import ChatInterface from "./ChatInterface";
import { MessageSquare, X, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Widget({ businessName, businessId }: { businessName: string; businessId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 font-sans">
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[380px] h-[600px] max-h-[80vh] bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200 flex flex-col"
          >
            <ChatInterface businessName={businessName} businessId={businessId} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className={`${
          open ? 'bg-slate-900' : 'bg-blue-600'
        } text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-blue-900/20 transition-colors focus:outline-none ring-offset-2 focus:ring-2 focus:ring-blue-600`}
      >
        {open ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
}
