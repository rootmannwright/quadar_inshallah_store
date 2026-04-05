import React from 'react';
import "../styles/videoplayer.css"
export default function VideoPlayer() {
  return (
    <div className="video-container">
      <iframe width="1415" height="796" src="https://www.youtube.com/embed/RB6jEZpL9Wg?list=RDRB6jEZpL9Wg" title="Lucki - Your Dreams [Produced With Flavor]" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </div>
  );
}