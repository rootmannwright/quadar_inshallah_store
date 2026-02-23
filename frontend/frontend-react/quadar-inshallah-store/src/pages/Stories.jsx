import { useState, useEffect, useRef } from "react"
import "../styles/stories.css"

export default function Stories() {
  const [modalOpen, setModalOpen] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    if (!videoRef.current) return
    modalOpen ? videoRef.current.play() : videoRef.current.pause()
  }, [modalOpen])

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden min-h-screen flex items-center justify-center text-center px-6">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          {""}
          <span className="text-yellow bg-clip-text bg-gradient-to-r from-primary to-primary-light">
           A Quadar Inshallah Co. & Records
          </span>
        </h2>

        <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptates ea odit dolor! Quae quis nemo officia, sunt et quaerat natus quod recusandae, velit possimus eligendi dolore itaque, deserunt suscipit? Ducimus?
        </p>

        {/* Thumbnail */}
        <div className="flex justify-center items-center relative">
          <div
            className="video-thumb"
            onClick={() => setModalOpen(true)}
          >
            <img
              src="https://images.unsplash.com/photo-1573148195900-7845dcb9b127"
              alt="Présentation Kela+"
            />
            <div className="play-overlay">
              <div className="play-circle">▶</div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div
          className="video-modal"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="video-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={(e) => {
                e.stopPropagation()
                setModalOpen(false)
              }}
            >
              ✕
            </button>

            <video
              ref={videoRef}
              controls
              loop
              className="w-full h-full object-cover"
            >
              <source
                src="https://cruip-tutorials.vercel.app/modal-video/video.mp4"
                type="video/mp4"
              />
            </video>
          </div>
        </div>
      )}
    </section>
  )
}