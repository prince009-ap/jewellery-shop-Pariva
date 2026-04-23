import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { MdFavoriteBorder, MdOutlineShoppingBag, MdPersonOutline } from "react-icons/md";
import FilterBar from "../../components/common/FilterBar";
import ProductCard from "../../components/common/ProductCard";
import API, { API_BASE_URL } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import useCart from "../../context/useCart";
import { clearUserSession, getStoredUser } from "../../utils/authStorage";
import Footer from "../../components/layout/Footer.jsx";
import MidBannerSlider from "../../components/home/MidBannerSlider";
import "../../styles/footer.css";
import { useAuthPrompt } from "../../context/AuthPromptContext";

import.meta.glob("../../assets/images/*.png", { eager: true, import: "default" });

const chunkItems = (items, size) => {
  if (!Array.isArray(items) || size <= 0) return [];
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

function MobilePagedRail({ items, itemsPerPage, className, renderPage, dotsLabel }) {
  const railRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const pages = useMemo(() => chunkItems(items, itemsPerPage), [items, itemsPerPage]);

  useEffect(() => {
    setActiveIndex(0);
    if (railRef.current) {
      railRef.current.scrollLeft = 0;
    }
  }, [pages.length]);

  const handleScroll = () => {
    if (!railRef.current) return;
    const { scrollLeft, clientWidth } = railRef.current;
    if (!clientWidth) return;
    setActiveIndex(Math.round(scrollLeft / clientWidth));
  };

  if (pages.length === 0) return null;

  return (
    <>
      <div className={className} ref={railRef} onScroll={handleScroll}>
        {pages.map((pageItems, index) => (
          <div key={`${dotsLabel}-${index}`} className="mobile-rail-page">
            {renderPage(pageItems, index)}
          </div>
        ))}
      </div>

      {pages.length > 1 ? (
        <div className="mobile-rail-dots" aria-label={dotsLabel}>
          {pages.map((_, index) => (
            <button
              key={`${dotsLabel}-dot-${index}`}
              type="button"
              className={`mobile-rail-dot ${index === activeIndex ? "active" : ""}`}
              aria-label={`Go to ${dotsLabel} page ${index + 1}`}
              onClick={() => {
                if (!railRef.current) return;
                railRef.current.scrollTo({
                  left: railRef.current.clientWidth * index,
                  behavior: "smooth",
                });
              }}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

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
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth
  );
  const accountRef = useRef(null);
  const searchRef = useRef(null);

  const { user, logout } = useAuth();
  const { showAuthPrompt } = useAuthPrompt();
  const storedUser = useMemo(() => getStoredUser(), [user]);
  const displayName = user?.name || storedUser?.name || "Guest User";
  const displayEmail = user?.email || storedUser?.email || "";
  const firstName = (displayName || "Guest User").split(" ")[0];
  const isLoggedIn = Boolean(user || storedUser);
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const categoryFromURL = params.get("category");
  const searchFromURL = (params.get("search") || "").trim();
  const { totalItems } = useCart();
  const isMobileHeader = viewportWidth < 768;
  const isMobileView = viewportWidth < 768;
  const mobileProductPageSize = 1;

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  const howItWorksSteps = useMemo(
    () => [
      {
        number: "01",
        kicker: "Discover",
        title: "Browse curated jewellery collections",
        description:
          "Explore categories, featured designs and trending pieces to discover styles for daily wear, gifting and special occasions.",
        note: "A simple starting point designed to help customers find the right piece quickly.",
      },
      {
        number: "02",
        kicker: "Shortlist",
        title: "Refine your shortlist with confidence",
        description:
          "Use filters, product details, wishlist and reviews to compare options and choose the design that fits your style and budget.",
        note: "Every important detail stays clear before the customer moves to cart.",
      },
      {
        number: "03",
        kicker: "Chat",
        title: "Get quick help while you shop",
        description:
          "Use live chat to ask about designs, order updates or anything you need before making a purchase.",
        note: "Fast support adds clarity and confidence throughout the journey.",
      },
      {
        number: "04",
        kicker: "Personalise",
        title: "Personalise with custom design support",
        description:
          "Customers looking for something unique can submit a custom request with their preferred metal, size, stones and reference details.",
        note: "This keeps the experience flexible for both ready-to-buy and custom jewellery buyers.",
      },
      {
        number: "05",
        kicker: "Checkout",
        title: "Checkout securely and track the order",
        description:
          "Finish with address selection, transparent pricing, secure payment options and order tracking from the customer account.",
        note: "The final step is built to feel clear, reliable and easy to trust.",
      },
    ],
    []
  );

  const promptSignIn = (message) => {
    setShowAccount(false);
    showAuthPrompt(message);
  };

  const handleProtectedNavigation = (path, message) => {
    setShowAccount(false);

    if (!isLoggedIn) {
      promptSignIn(message);
      return;
    }

    navigate(path);
  };

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
            <button
              className="pill-button"
              onClick={() =>
                handleProtectedNavigation("/wishlist", "Please sign in to view and manage your wishlist.")
              }
              aria-label="Wishlist"
            >
              {isMobileHeader ? <MdFavoriteBorder size={23} /> : "Wishlist"}
            </button>

            <div ref={accountRef} style={{ position: "relative" }}>
              {isLoggedIn ? (
                <button className="pill-button" onClick={() => setShowAccount((prev) => !prev)} aria-label="Account">
                  {isMobileHeader ? firstName.slice(0, 1).toUpperCase() : firstName}
                </button>
              ) : (
                <button
                  className="pill-button"
                  onClick={() => navigate("/login", { state: { from: location.pathname } })}
                  aria-label="Sign In"
                >
                  {isMobileHeader ? <MdPersonOutline size={23} /> : "Sign In"}
                </button>
              )}

              {isLoggedIn && showAccount ? (
                <div className="account-dropdown">
                  <p>
                    <strong>{displayName}</strong>
                  </p>
                  {displayEmail ? <p>{displayEmail}</p> : null}

                  <hr />

                  <button
                    onClick={() => {
                      handleProtectedNavigation("/account/orders", "Please sign in to view your orders.");
                    }}
                  >
                    Orders
                  </button>

                  <button
                    onClick={() => {
                      handleProtectedNavigation("/account/profile", "Please sign in to manage your profile.");
                    }}
                  >
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      handleProtectedNavigation("/account/addresses", "Please sign in to manage your saved addresses.");
                    }}
                  >
                    Addresses
                  </button>

                  <hr />

                  <button
                    className="account-logout-btn"
                    onClick={() => {
                      setShowAccount(false);
                      logout();
                      clearUserSession();
                      navigate("/home", { replace: true });
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>

            <button className="pill-button pill-accent cart-btn" onClick={() => navigate("/cart")} aria-label="Cart">
              {isMobileHeader ? <MdOutlineShoppingBag size={23} /> : "Cart"}
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
                Explore Collections
              </a>
              <a href="#custom" className="hero-cta ghost-cta">
                Design Your Own
              </a>
            </div>
            <div className="hero-meta">
              <span>Free insured delivery</span>
              <span>7-day returns</span>
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
        {isMobileView ? (
          <MobilePagedRail
            items={categories}
            itemsPerPage={4}
            className="mobile-rail mobile-category-rail"
            dotsLabel="category"
            renderPage={(pageItems) => (
              <div className="mobile-category-grid">
                {pageItems.map((cat) => (
                  <article
                    key={cat.name}
                    className="category-card category-card-mobile"
                    onClick={() => navigate(`/category/${cat.name.toLowerCase()}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="category-image">
                      <img src={`${API_BASE_URL}/uploads/${cat.image}`} alt={cat.name} />
                    </div>
                    <h3>{cat.name}</h3>
                    <p>Discover {cat.name.toLowerCase()} designed for modern jewellery wardrobes.</p>
                  </article>
                ))}
              </div>
            )}
          />
        ) : (
          <div className="category-grid">
            {categories.map((cat) => (
              <article
                key={cat.name}
                className="category-card"
                onClick={() => navigate(`/category/${cat.name.toLowerCase()}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="category-image">
                  <img src={`${API_BASE_URL}/uploads/${cat.image}`} alt={cat.name} />
                </div>
                <h3>{cat.name}</h3>
                <p>Discover {cat.name.toLowerCase()} designed for modern jewellery wardrobes.</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section products" id="featured">
        <div className="section-header">
          <h2>Featured</h2>
          <p>Timeless designs our community returns to, season after season.</p>
        </div>
        {isMobileView ? (
          <MobilePagedRail
            items={featured}
            itemsPerPage={mobileProductPageSize}
            className="mobile-rail mobile-product-rail"
            dotsLabel="featured products"
            renderPage={(pageItems) => (
              <div className={`mobile-product-page mobile-product-page-${mobileProductPageSize}`}>
                {pageItems.map((p) => (
                  <ProductCard key={p._id} product={p} onAddToCart={() => {}} />
                ))}
              </div>
            )}
          />
        ) : (
          <div className="product-grid">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} onAddToCart={() => {}} />
            ))}
          </div>
        )}
      </section>

      <section className="section products">
        <div className="section-header">
          <h2>Trending Now</h2>
          <p>Pieces that are being added to carts across the country right now.</p>
        </div>
        {isMobileView ? (
          <MobilePagedRail
            items={trending}
            itemsPerPage={mobileProductPageSize}
            className="mobile-rail mobile-product-rail"
            dotsLabel="trending products"
            renderPage={(pageItems) => (
              <div className={`mobile-product-page mobile-product-page-${mobileProductPageSize}`}>
                {pageItems.map((p) => (
                  <ProductCard key={p._id} product={p} onAddToCart={() => {}} />
                ))}
              </div>
            )}
          />
        ) : (
          <div className="product-grid">
            {trending.map((p) => (
              <ProductCard key={p._id} product={p} onAddToCart={() => {}} />
            ))}
          </div>
        )}
      </section>

      <section className="section products">
        <div className="section-header">
          <h2>Recommended For You</h2>
          <p>A curation inspired by minimal daily wear and modern heirlooms.</p>
        </div>
        {isMobileView ? (
          <MobilePagedRail
            items={recommended}
            itemsPerPage={mobileProductPageSize}
            className="mobile-rail mobile-product-rail"
            dotsLabel="recommended products"
            renderPage={(pageItems) => (
              <div className={`mobile-product-page mobile-product-page-${mobileProductPageSize}`}>
                {pageItems.map((p) => (
                  <ProductCard key={p._id} product={p} onAddToCart={() => {}} />
                ))}
              </div>
            )}
          />
        ) : (
          <div className="product-grid">
            {recommended.map((p) => (
              <ProductCard key={p._id} product={p} onAddToCart={() => {}} />
            ))}
          </div>
        )}
      </section>

      <section className="section how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>A simple and elegant path from discovery to delivery.</p>
        </div>
        <div className="steps-shell">
          <div className="steps-intro">
            <span className="steps-intro-kicker">Pariva Journey</span>
            <h3>A clear jewellery buying experience built around trust, choice and convenience.</h3>
            <p>
              Customers can explore collections, refine their selection, request custom designs and
              complete their purchase with a smooth checkout and tracking flow.
            </p>
          </div>
          {isMobileView ? (
            <MobilePagedRail
              items={howItWorksSteps}
              itemsPerPage={1}
              className="mobile-rail mobile-steps-rail"
              dotsLabel="journey steps"
              renderPage={(pageItems) => (
                <div className="mobile-steps-page">
                  {pageItems.map((step) => (
                    <article className="step-card" key={step.number}>
                      <div className="step-number">{step.number}</div>
                      <span className="step-kicker">{step.kicker}</span>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                      <span className="step-note">{step.note}</span>
                    </article>
                  ))}
                </div>
              )}
            />
          ) : (
            <div className="steps-grid">
              {howItWorksSteps.map((step) => (
                <article className="step-card" key={step.number}>
                  <div className="step-number">{step.number}</div>
                  <span className="step-kicker">{step.kicker}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <span className="step-note">{step.note}</span>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section custom-cta" id="custom">
        <div className={`custom-cta-inner ${isMobileView ? "custom-cta-inner-mobile" : ""}`}>
          <div className="custom-cta-text">
            <h2>Design with PARIVA Studio</h2>
            <p>
              Build a piece around your story — choose your metal, purity, stones and silhouette,
              while watching the estimate adapt in real time.
            </p>
          </div>

          <div className={`custom-cta-actions ${isMobileView ? "custom-cta-actions-mobile" : ""}`}>
            <Link to="/custom-design" className="hero-cta primary-cta">
              Open Custom Studio
            </Link>
            <Link
              to="/my-custom-designs"
              className="hero-cta ghost-cta"
              onClick={(event) => {
                if (isLoggedIn) return;
                event.preventDefault();
                promptSignIn("Please sign in to view your custom design requests.");
              }}
            >
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
