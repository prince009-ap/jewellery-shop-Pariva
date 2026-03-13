import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import FilterBar from "../../components/common/FilterBar";
import ProductCard from "../../components/common/ProductCard";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import useCart from "../../context/useCart";
import { clearUserSession, getStoredUser } from "../../utils/authStorage";
import Footer from "../../components/layout/Footer.jsx";
import MidBannerSlider from "../../components/home/MidBannerSlider";
import "../../styles/footer.css";

import.meta.glob("../../assets/images/*.png", { eager: true, import: "default" });

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [metal, setMetal] = useState("");
  const [occasion, setOccasion] = useState("");
  const [sort, setSort] = useState("relevance");
  const [showAccount, setShowAccount] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const accountRef = useRef(null);
  const searchRef = useRef(null);

  const { user, logout } = useAuth();
  const storedUser = useMemo(() => getStoredUser(), [user]);
  const displayName = user?.name || storedUser?.name || "Guest User";
  const displayEmail = user?.email || storedUser?.email || "";
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const categoryFromURL = params.get("category");
  const searchFromURL = (params.get("search") || "").trim();
  const { totalItems } = useCart();

  useEffect(() => {
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
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setShowAccount(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSearch(searchFromURL);
  }, [searchFromURL]);

  const buildSearchText = (product) =>
    [
      product?.name,
      product?.description,
      product?.shortDescription,
      product?.category,
      product?.subcategory,
      product?.brand,
      product?.sku,
      product?.metal,
      product?.purity,
      product?.occasion,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

  const updateSearchParam = (value) => {
    const next = new URLSearchParams(params);
    const cleaned = String(value || "").trim();
    if (cleaned) {
      next.set("search", cleaned);
    } else {
      next.delete("search");
    }
    setParams(next, { replace: true });
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setShowSuggestions(true);
    updateSearchParam(value);
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await API.get("/products");
        const list = res.data;
        setAllProducts(list);
        setProducts(list);

        const categoryMap = {};
        list.forEach((p) => {
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
    if (!search || !search.trim()) return [];
    const q = search.toLowerCase();
    return allProducts.filter((p) => buildSearchText(p).includes(q)).slice(0, 6);
  }, [search, allProducts]);

  const filteredProducts = useMemo(() => {
    let items = [...allProducts];

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((p) => buildSearchText(p).includes(q));
    }

    if (categoryFromURL) {
      const categoryQuery = categoryFromURL.toLowerCase();
      items = items.filter((p) => p.category?.toLowerCase() === categoryQuery);
    }

    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      items = items.filter((p) => p.price >= min && p.price <= max);
    }

    if (metal) items = items.filter((p) => p.metal === metal);
    if (occasion) items = items.filter((p) => p.occasion === occasion);

    if (sort === "price-asc") {
      items.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === "price-desc") {
      items.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === "popularity") {
      items.sort((a, b) => {
        const scoreA = (a.totalReviews || 0) * 2 + (a.averageRating || 0) + (a.isTrending ? 2 : 0);
        const scoreB = (b.totalReviews || 0) * 2 + (b.averageRating || 0) + (b.isTrending ? 2 : 0);
        return scoreB - scoreA;
      });
    }

    return items;
  }, [allProducts, search, categoryFromURL, priceRange, metal, occasion, sort]);

  const featured = filteredProducts.filter((p) => p.isFeatured).slice(0, 6);
  const trending = filteredProducts.filter((p) => p.isTrending).slice(0, 6);
  const recommended = filteredProducts.filter((p) => p.isRecommended).slice(0, 6);

  return (
    <div className="home-page">
      <div className="top-bar">
        <div className="top-bar-inner">
          <span>Free Insured Shipping</span>
          <span className="dot">•</span>
          <span>BIS Hallmark Certified</span>
          <span className="dot">•</span>
          <span>Lifetime Exchange</span>
        </div>
      </div>

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
            <button className="pill-button" onClick={() => navigate("/wishlist")}>
              Wishlist
            </button>

            <div ref={accountRef} style={{ position: "relative" }}>
              <button className="pill-button" onClick={() => setShowAccount((prev) => !prev)}>
                Account
              </button>

              {showAccount ? (
                <div className="account-dropdown">
                  <p>
                    <strong>{displayName}</strong>
                  </p>
                  {displayEmail ? <p>{displayEmail}</p> : null}

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
                    className="account-logout-btn"
                    onClick={() => {
                      logout();
                      clearUserSession();
                      navigate("/login");
                      window.location.reload();
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>

            <button className="pill-button pill-accent cart-btn" onClick={() => navigate("/cart")}>
              Cart
              {totalItems > 0 ? <span className="cart-badge">{totalItems}</span> : null}
            </button>
          </div>
        </div>
      </header>

      <FilterBar
        search={search}
        onSearchChange={handleSearchChange}
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        onSuggestionClick={(value) => {
          handleSearchChange(value);
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
        metals={[...new Set(products.map((p) => p.metal))]}
        occasions={[...new Set(products.map((p) => p.occasion))]}
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
            <div className="hero-banner-shell">
              <div className="hero-image-placeholder">
                <div className="hero-image hero-image-stage">
                <MidBannerSlider fillHeight />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section categories" id="discover">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <p>Explore finely crafted pieces, curated for every mood and moment.</p>
        </div>
        <div className="category-grid">
          {categories.map((cat) => (
            <article
              key={cat.name}
              className="category-card"
              onClick={() => navigate(`/category/${cat.name.toLowerCase()}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="category-image">
                <img src={`http://localhost:5000/uploads/${cat.image}`} alt={cat.name} />
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
            <ProductCard key={p._id} product={p} onAddToCart={() => {}} />
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
            <ProductCard key={p._id} product={p} onAddToCart={() => {}} />
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
            <ProductCard key={p._id} product={p} onAddToCart={() => {}} />
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

          <div className="custom-cta-actions">
            <Link to="/custom-design" className="hero-cta primary-cta">
              Open Custom Studio
            </Link>
            <Link to="/my-custom-designs" className="hero-cta ghost-cta">
              My Custom Requests
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
