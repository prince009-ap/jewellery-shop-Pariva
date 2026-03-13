import { useEffect, useState } from "react";
import API from "../../services/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function MidBannerSlider({ category = "", fillHeight = false, fit = "contain" }) {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const params = category ? { params: { category } } : undefined;
    API.get("/banners", params).then(res => setBanners(res.data));
  }, [category]);

  if (!banners.length) return null;

  return (
    <section
      className={`mid-banner${fillHeight ? " mid-banner--fill-height" : ""} ${
        fit === "cover" ? " mid-banner--cover" : ""
      }`}
    >
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        loop
        pagination={{ clickable: true }}
        className="mid-banner-swiper"
      >
        {banners.map(b => (
          <SwiperSlide key={b._id}>
            <a href={b.link || "#"} className="mid-banner-link">
              <div className="mid-banner-image-wrapper">
                <img
                  className="mid-banner-image"
                  src={`http://localhost:5000/uploads/${b.imageDesktop}`}
                  alt={b.title || "Banner"}
                  loading="lazy"
                />
              </div>
            </a>
          </SwiperSlide>
        ))}     
      </Swiper>
    </section>
  );
}
