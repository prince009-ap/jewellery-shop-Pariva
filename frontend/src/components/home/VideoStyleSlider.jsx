import { useRef, useState } from "react";
import "./VideoStyleSlider.css";

import style1 from "../../assets/videos/style1.mp4";
import style2 from "../../assets/videos/style2.mp4";

const VIDEOS = [
  {
    id: 1,
    title: "From Day to Night",
    subtitle: "Styling 101 with Diamonds",
    src: style1,
  },
  {
    id: 2,
    title: "Modern Elegance",
    subtitle: "Minimal diamond looks",
    src: style2,
  },
];

export default function VideoStyleSlider() {
  const [active, setActive] = useState(0);

  // 👇 per-video state
  const [videoState, setVideoState] = useState(
    VIDEOS.map(() => ({
      muted: true,
      playing: true,
    }))
  );

  const videoRefs = useRef([]);

  const toggleMute = (index) => {
    const updated = [...videoState];
    updated[index].muted = !updated[index].muted;
    videoRefs.current[index].muted = updated[index].muted;
    setVideoState(updated);
  };

  const togglePlay = (index) => {
    const updated = [...videoState];
    updated[index].playing = !updated[index].playing;

    if (updated[index].playing) {
      videoRefs.current[index].play();
    } else {
      videoRefs.current[index].pause();
    }

    setVideoState(updated);
  };

  const prev = () =>
    setActive((p) => (p === 0 ? VIDEOS.length - 1 : p - 1));
  const next = () =>
    setActive((p) => (p === VIDEOS.length - 1 ? 0 : p + 1));

  return (
    <section className="video-style-section">
      <h2>Styling 101 With Diamonds</h2>
      <p>Trendsetting diamond jewellery suited for every occasion</p>

      <div className="video-slider">
        <button className="nav-btn left" onClick={prev}>‹</button>

        <div className="video-track">
          {VIDEOS.map((v, i) => (
            <div
              key={v.id}
              className={`video-card ${i === active ? "active" : ""}`}
            >
              <video
                ref={(el) => (videoRefs.current[i] = el)}
                src={v.src}
                muted={videoState[i].muted}
                loop
                playsInline
                autoPlay={i === active}
              />

              {/* 🎮 CONTROLS – ONLY FOR ACTIVE VIDEO */}
              {i === active && (
                <div className="video-controls-overlay">
                  <button onClick={() => togglePlay(i)}>
                    {videoState[i].playing ? "⏸" : "▶️"}
                  </button>
                  <button onClick={() => toggleMute(i)}>
                    {videoState[i].muted ? "🔇" : "🔊"}
                  </button>
                </div>
              )}

              {i === active && (
                <div className="video-overlay">
                  <span>{v.subtitle}</span>
                  <h3>{v.title}</h3>
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="nav-btn right" onClick={next}>›</button>
      </div>
    </section>
  );
}
