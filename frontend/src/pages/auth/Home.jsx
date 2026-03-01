import React, { useEffect, useMemo, useState } from "react";
import FilterBar from "../../components/common/FilterBar";
import ProductCard from "../../components/common/ProductCard";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import useCart from "../../context/useCart";
import Footer from "../../components/layout/Footer.jsx";
import MidBannerSlider from "../../components/home/MidBannerSlider";
import VideoStyleSlider from "../../components/home/VideoStyleSlider";
import { useRef } from "react";
import { useLocation } from "react-router-dom";
import "../../styles/footer.css";

import.meta.glob(
  "../../assets/images/*.png",
  { eager: true, import: "default" }
);



function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);



  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [metal, setMetal] = useState("");
  const [occasion, setOccasion] = useState("");
  const [sort, setSort] = useState("featured");
  const [showAccount, setShowAccount] = useState(false);
 const accountRef = useRef(null);


const [showSuggestions, setShowSuggestions] = useState(false);
const searchRef = useRef(null);




  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
const categoryFromURL = params.get("category");

 const location = useLocation();

  useEffect(() => {
    // Handle hash scrolling on page load
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);


useEffect(() => {
  const handleClickOutside = (e) => {
    if (
      accountRef.current &&
      !accountRef.current.contains(e.target)
    ) {
      setShowAccount(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

useEffect(() => {
  const handleClickOutside = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setShowSuggestions(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

 useMemo(() => {
  if (!search.trim()) return [];

  const q = search.toLowerCase();

  return products
    .filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
    .slice(0, 6); // max 6 suggestions
}, [search, products]);


useEffect(() => {
  const loadProducts = async () => {
    try {
      const res = await API.get("/products");
      const list = res.data;

      setAllProducts(list);   // ✅ MASTER COPY
      setProducts(list);      // ✅ DISPLAY COPY

      const categoryMap = {};
      list.forEach(p => {
        if (!categoryMap[p.category]) {
          categoryMap[p.category] = p.image;
        }
      });

      setCategories(
        Object.entries(categoryMap).map(([name, image]) => ({
          name,
          image,
        }))
      );
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  loadProducts();
}, []);



const suggestions = useMemo(() => {
  if (!search || typeof search !== "string" || !search.trim()) {
    return [];
  }

  const q = search.toLowerCase();

  return allProducts
    .filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)||
      p.metal?.toLowerCase().includes(q) ||
      p.occasion?.toLowerCase().includes(q)
    )
    .slice(0, 6); // max 6 suggestions
}, [search, allProducts]);






const filteredProducts = useMemo(() => {
  let items = [...allProducts];

  // 🔎 SEARCH
  if (search.trim()) {
    const q = search.toLowerCase();
    items = items.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  // 📂 CATEGORY (URL se)
  if (categoryFromURL) {
    items = items.filter(p => p.category === categoryFromURL);
  }

  // 💰 PRICE
  if (priceRange) {
    const [min, max] = priceRange.split("-").map(Number);
    items = items.filter(p => p.price >= min && p.price <= max);
  }

  // 🪙 METAL
  if (metal) items = items.filter(p => p.metal === metal);

  // 🎉 OCCASION
  if (occasion) items = items.filter(p => p.occasion === occasion);

  return items;
}, [
  allProducts,
  search,
  categoryFromURL,
  priceRange,
  metal,
  occasion
]);



  const featured = filteredProducts.filter(p => p.isFeatured).slice(0,6);
  const trending = filteredProducts.filter(p => p.isTrending).slice(0,6);
  const recommended = filteredProducts.filter(p => p.isRecommended).slice(0,6);


  const { totalItems } = useCart();

  return (
    <div className="home-page">
               {/* ===== TOP BAR ===== */}
     <div className="top-bar">
    <div className="top-bar-inner">
      <span>Free Insured Shipping</span>
      <span className="dot">•</span>
      <span>BIS Hallmark Certified</span>
      <span className="dot">•</span>
      <span>Lifetime Exchange</span>
    </div>
  </div>

      {/* ===== HEADER ===== */}
      <header className="main-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-mark">P</span>
            <span className="logo-text">PARIVA</span>
          </div>

          

<nav className="nav-links">
  <Link to="/category/rings">Rings</Link>
  <Link to="/category/Necklaces">Necklaces</Link>
  <Link to="/category/bracelet">Bracelets</Link>
  <Link to="/category/pandent">Pendants</Link>
  <Link to="/category/Earrings">Earrings</Link>
  <Link to="/category/Bangles">Bangles</Link>
</nav>

          <div className="header-actions">
            <button className="pill-button" onClick={() => navigate("/wishlist")}>Wishlist</button>

            <div ref={accountRef} style={{ position: "relative" }}>
  <button
    className="pill-button"
    onClick={() => setShowAccount((prev) => !prev)}
  >
    Account
  </button>

  {showAccount && (
    <div className="account-dropdown">
      <p><strong>{user?.name}</strong></p>
      <p>{user?.email}</p>

      <hr />

      <button
        onClick={() => {
          setShowAccount(false);
          navigate("/account/orders");
        }}
      >
        Orders
      </button>

      <button
        onClick={() => {
          setShowAccount(false);
          navigate("/account/profile");
        }}
      >
        Profile
      </button>

      <button
        onClick={() => {
          setShowAccount(false);
          navigate("/account/addresses");
        }}
      >
        Addresses
      </button>

      <hr />

      <button
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
          window.location.reload();
        }}
      >
        Logout
      </button>
    </div>
  )}
</div>


           <button
      className="pill-button pill-accent cart-btn"
      onClick={() => navigate("/cart")}
    >
      CART
      {totalItems > 0 && (
        <span className="cart-badge">{totalItems}</span>
      )}
    </button>

          </div>
        </div>
      </header>
      <FilterBar
        search={search}
  onSearchChange={(val) => {
    setSearch(val);
    setShowSuggestions(true);
  }}
  showSuggestions={showSuggestions}
  suggestions={suggestions}
  onSuggestionClick={(value) => {
    setSearch(value);
    setShowSuggestions(false);
  }}
  searchRef={searchRef}
        priceRange={priceRange}
        onPriceChange={setPriceRange}
        metal={metal}
        onMetalChange={setMetal}
        occasion={occasion}
        onOccasionChange={setOccasion}
        sort={sort}
       onSortChange={setSort}
       metals={[...new Set(products.map(p => p.metal))]}
occasions={[...new Set(products.map(p => p.occasion))]}

      />
      
      <section className="hero">
       

    
        <div className="hero-inner">
          <div className="hero-content">
            <p className="hero-kicker">Fine Jewellery • Crafted in India</p>
            <h1>Subtle luxury that lives with you, every single day.</h1>
            <p className="hero-subtext">
              PARIVA brings together BIS-hallmarked craftsmanship and contemporary design,
              creating jewellery that feels as effortless as it looks timeless.
            </p>
            <div className="hero-actions">
              <a href="#featured" className="hero-cta primary-cta">
                Explore Best Sellers
              </a>
              <a href="#custom" className="hero-cta ghost-cta">
                Design Your Own
              </a>
            </div>
            <div className="hero-meta">
              <span>Free insured delivery</span>
              <span>7-day returns</span>
              <span>Lifetime exchange</span>
            </div>
            <div className="hero-badge below">
    <span className="hero-badge-title">Trusted by 50K+ customers</span>
    <span className="hero-badge-sub">Across 120+ Indian cities</span>
  </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-placeholder">
            
            <div className="hero-image">< MidBannerSlider /></div>
            </div>
            
          </div>
        </div>
      </section>

      <VideoStyleSlider />

      <section className="section categories" id="couples">
        <div className="section-header">
          <h2>Couple Collections</h2>
          <p>Perfectly matched sets for couples who celebrate their love together</p>
        </div>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <button
            onClick={() => navigate("/couples")}
            style={{
              padding: "1rem 2rem",
              backgroundColor: "#d4af37",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#b8941f";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#d4af37";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Explore Couple Sets
          </button>
        </div>
      </section>

      <section className="section categories" id="discover">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <p>Explore finely crafted pieces, curated for every mood and moment.</p>
        </div>
        <div className="category-grid">
          {categories.length > 0 &&
  categories.map(cat => (
    <article 
      key={cat.name} 
      className="category-card"
      onClick={() => navigate(`/category/${cat.name.toLowerCase()}`)}
      style={{ cursor: "pointer" }}
    >
     <div className="category-image">
                 <img
  src={`http://localhost:5000/uploads/${cat.image}`}
  alt={cat.name}
/>



              </div>
              <h3>{cat.name}</h3>
              <p>Discover {cat.name.toLowerCase()} designed for modern jewellery wardrobes.</p>
    </article>
))}

        
        </div>
      </section>

      <section className="section products" id="featured">
        <div className="section-header">
          <h2>Featured</h2>
          <p>Timeless designs our community returns to, season after season.</p>
        </div>
        <div className="product-grid">
          {featured.map((p) => (
            <ProductCard key={p._id} product={p} onAddToCart={()=>{}} />
          ))}
        </div>
      </section>

      <section className="section products">
        <div className="section-header">
          <h2>Trending Now</h2>
          <p>Pieces that are being added to carts across the country right now.</p>
        </div>
        <div className="product-grid">
          {trending.map((p) => (
               <ProductCard key={p._id} product={p} onAddToCart={()=>{}} />
            ))}
        </div>
      </section>

      <section className="section products">
        <div className="section-header">
          <h2>Recommended For You</h2>
          <p>A curation inspired by minimal daily wear and modern heirlooms.</p>
        </div>
        <div className="product-grid">
          {recommended.map((p) => (
               <ProductCard key={p._id} product={p} onAddToCart={()=>{}} />
            ))}
        </div>
      </section>

      <section className="section how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>A seamless journey from shortlist to sparkle.</p>
        </div>
        <div className="steps-grid">
          <article className="step-card">
            <div className="step-number">01</div>
            <h3>Browse Jewellery</h3>
            <p>Explore curated categories, collections and wedding edits.</p>
          </article>
          <article className="step-card">
            <div className="step-number">02</div>
            <h3>Apply Filters</h3>
            <p>Refine by price, metal, occasion and purity for the perfect match.</p>
          </article>
          <article className="step-card">
            <div className="step-number">03</div>
            <h3>Customise & Compare</h3>
            <p>Use the PARIVA custom studio to design pieces that are uniquely yours.</p>
          </article>
          <article className="step-card">
            <div className="step-number">04</div>
            <h3>Secure Checkout</h3>
            <p>Enjoy insured shipping, BIS certification and lifetime exchange.</p>
          </article>
        </div>
      </section>

     

      <section className="section custom-cta" id="custom">
        <div className="custom-cta-inner">
          <div className="custom-cta-text">
            <h2>Design with PARIVA Studio</h2>
            <p>
              Build a piece around your story — choose your metal, purity, stones and silhouette,
              while watching the estimate adapt in real time.
            </p>
          </div>
        

<Link to="/custom-design" className="hero-cta primary-cta">
  Open Custom Studio
</Link>

        </div>
      </section>


        <Footer />
    </div>
  );
}

export default Home;
