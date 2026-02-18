import { useEffect, useRef } from "react"

export default function VideoPlayer() {
  const playButtonRef = useRef(null)
  const thumbnailRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    const playButton = playButtonRef.current
    const thumbnail = thumbnailRef.current
    const videoContainer = videoRef.current

    if (!playButton || !thumbnail || !videoContainer) return

    const handlePlay = () => {
      thumbnail.classList.add("hidden")
      videoContainer.classList.remove("hidden")
    }

    playButton.addEventListener("click", handlePlay)

    return () => {
      playButton.removeEventListener("click", handlePlay)
    }
  }, [])

  return (
    <div className="relative rounded-xl overflow-hidden shadow-2xl">
      {/* THUMBNAIL */}
      <div ref={thumbnailRef} id="thumbnail" className="relative">
        <img
          src="https://i.ytimg.com/vi/yk43rMG3hvs/maxresdefault.jpg"
          alt="Video thumbnail"
          className="w-full aspect-video object-cover"
        />

        <div
          ref={playButtonRef}
          id="play-button"
          className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-[#b03536]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M4 4l12 6-12 6V4z" />
          </svg>
        </div>
      </div>

      {/* VIDEO */}
      <div
        ref={videoRef}
        id="video"
        className="hidden aspect-video relative"
      >
        <iframe
          className="absolute inset-0 w-full h-full"
          src="https://youtube.com/embed/Q2tjQdizayE?list=RDmMjcKIAk5Jc"
          title="The Artist Barefoot Showcase"
          frameBorder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}