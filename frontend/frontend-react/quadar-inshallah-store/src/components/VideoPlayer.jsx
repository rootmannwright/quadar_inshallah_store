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
        <div ref={thumbnailRef} className="relative">
          <img
            src="https://yt3.googleusercontent.com/LBHod_gSyAz8lQTcoWYmp6N654s43VXskc50p8EWRL8ux7DIDJdJ6uhduQ6_NcsN_H0X6rh7=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj"
            alt="Quadar Inshallah store promotional video thumbnail featuring the brand logo and imagery representing the store, with a play button overlay ready to launch video content"
            className="w-full aspect-video object-cover"
          />

          {/* PLAY BUTTON */}
        <div
          ref={playButtonRef}
          className="
            absolute inset-0 
            flex items-center justify-center 
            cursor-pointer 
            group
            bg-black/30
            transition-all duration-300
          "
        >
          <div
            className="
              flex items-center justify-center
              w-20 h-20
              rounded-full
              bg-black/60 backdrop-blur-md
              border border-white/20
              shadow-2xl
              transition-all duration-300 ease-out
              group-hover:scale-110
              group-hover:bg-[#b03536]/80
              active:scale-95
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-white translate-x-[1px]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M4 4l12 6-12 6V4z" />
            </svg>
          </div>
        </div>
      </div>

      {/* VIDEO */}
      <div
        ref={videoRef}
        className="hidden aspect-video relative"
      >
        <iframe
          className="absolute inset-0 w-full h-full"
          src="https://www.youtube.com/embed/watch?v=6HgonwiDlbE&list=RDmMjcKIAk5Jc&index=9"
          title="Video Player"
          frameBorder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}