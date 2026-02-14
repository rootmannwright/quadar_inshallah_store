import { motion } from "framer-motion"

export default function ScrambleText({ text, as = "h1", duration = 3.0 }) {
  const Tag = motion[as] || motion.h1

  return (
    <Tag
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration }}
    >
      {text}
    </Tag>
  )
}