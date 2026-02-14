import { animate, inView } from "https://cdn.jsdelivr.net/npm/motion@12.34.0/+esm"

inView(".scroll-section pre", (element) => {
        animate(
            element,
            { opacity: 1, x: [-100, 0] },
            {
                duration: 0.9,
                easing: [0.17, 0.55, 0.55, 1],
            }
        )

        return () => animate(element, { opacity: 0, x: -100 })
    })