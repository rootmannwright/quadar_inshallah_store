import React from 'react';
import "../styles/videoplayer.css"
export default function VideoPlayer() {
  return (
    <div className="video-container">
      <iframe width="1415" height="796" src="https://www.youtube.com/embed/5W1xGsm0mmE?list=RDxkYKXbLQW5w" title="The Ice King" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </div>
  );
}