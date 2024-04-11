"use client";
import { motion } from "framer-motion";

export default function StaggeredText() {
  const sentence = "The moment that it takes to you read this sentence...";
  const words = sentence.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Adjust as needed for timing
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ease: "easeInOut",
        duration: 0.5, // Adjust as needed for timing
      },
    },
  };

  return (
    <motion.div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "100px",
        flexWrap: "wrap", // Ensure it wraps if needed
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={childVariants}
          style={{ marginRight: "8px" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
