import { useState } from "react"
import {  useScroll, useMotionValueEvent } from "framer-motion"
import logo from "../assets/logos/about.svg"

export default function Header() {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0

    if (current > previous && current > 150) {
      setHidden(true) // rolando pra baixo → esconde
    } else {
      setHidden(false) // rolando pra cima → mostra
    }
  })

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 w-full bg-white shadow z-50"
    >
      <div className="p-4 flex justify-center items-center">
        <img src={logo} alt="Quadar Inshallah Co. & Records Logo" className="h-12" />
      </div>
    </motion.header>
  )
}