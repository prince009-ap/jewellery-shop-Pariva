import { useEffect, useState } from "react";
import API from "../../services/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function MidBannerSlider() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    API.get("/banners").then(res => setBanners(res.data));
  }, []);

  if (!banners.length) return null;

  return (
    <section className="mid-banner">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        loop
        pagination={{ clickable: true }}
      >
        {banners.map(b => (
          <SwiperSlide key={b._id}>
            <a href={b.link || "#"} className="mid-banner-link">
              <div className="mid-banner-image-wrapper">
                <img
                  src={`http://localhost:5000/uploads/${b.imageDesktop}`}
                  alt={b.title || "Banner"}
                />
              </div>
            </a>
          </SwiperSlide>
        ))}     
      </Swiper>
    </section>
  );
}
