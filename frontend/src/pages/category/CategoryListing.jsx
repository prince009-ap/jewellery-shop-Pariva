import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SelectDropdown from "../../components/common/SelectDropdown";
import API, { API_BASE_URL } from "../../services/api";
import useCart from "../../context/useCart";
import QuantitySelector from "../../components/common/QuantitySelector";
import WorkingWishlistHeart from "../../components/wishlist/WorkingWishlistHeart";
import StarRating from "../../components/StarRating";
import { PRODUCT_CATEGORIES } from "../../constants/productOptions";
import styles from "./CategoryListing.module.css";

const CATEGORY_DESCRIPTIONS = {
  rings: "Statement rings and daily silhouettes",
  necklaces: "Layered elegance and occasion pieces",
  bracelet: "Refined wristwear with subtle shine",
  bracelets: "Refined wristwear with subtle shine",
  pandent: "Lightweight detail pieces for every day",
  pendants: "Lightweight detail pieces for every day",
  earrings: "Crafted drops, studs, and festive pairs",
  bangles: "Traditional lines with modern polish",
  chains: "Sleek chain styles for layering and gifting",
  anklets: "Graceful anklewear with festive charm",
  mangalsutra: "Sacred silhouettes designed with modern elegance",
  "nose-pins": "Delicate accents for subtle shine",
  "maang-tikka": "Bridal forehead pieces with timeless detailing",
  "toe-rings": "Minimal finishing touches for everyday styling",
  kada: "Bold heritage cuffs with polished structure",
  chokers: "Closer neckline pieces for standout dressing",
  "jewellery-sets": "Complete coordinated looks for celebrations",
  "bridal-sets": "Wedding-ready sets with statement presence",
  brooches: "Decorative accents for special styling moments",
  charms: "Small symbolic pieces with personal meaning",
};

const CATEGORY_SLUG_OVERRIDES = {
  bracelets: "bracelet",
  pendants: "pandent",
};

const formatCategoryLabel = (value) =>
  String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getCategorySlug = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return CATEGORY_SLUG_OVERRIDES[normalized] || normalized.replace(/\s+/g, "-");
};

const buildCategoryItem = (value) => {
  const slug = getCategorySlug(value);
  return {
    label: formatCategoryLabel(value),
    slug,
    description:
      CATEGORY_DESCRIPTIONS[slug] || "Beautiful jewellery collection tailored for every moment",
  };
};

export default function CategoryListing() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart: addToCartContext, updateQty } = useCart();
  const productRailRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  const [activeProductSlide, setActiveProductSlide] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState({
    priceRange: [0, 2000000],
    metal: [],
    purity: [],
    occasion: [],
    weightRange: [0, 100],
    availability: "all",
    featured: false,
    trending: false,
  });
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [weightRange, setWeightRange] = useState([0, 100]);

  const categoryLinks = [
    ...new Map(
      [...PRODUCT_CATEGORIES, formatCategoryLabel(category)]
        .filter(Boolean)
        .map((item) => {
          const builtItem = buildCategoryItem(item);
          return [builtItem.slug, builtItem];
        })
    ).values(),
  ];

  const metalOptions = [...new Set(products.map((product) => product.metal).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
  const purityOptions = [...new Set(products.map((product) => product.purity).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
  const occasionOptions = [...new Set(products.map((product) => product.occasion).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );

  const fetchCategoryProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/products/category/${category}`);
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  const applyFiltersAndSort = useCallback(() => {
    if (!Array.isArray(products)) {
      setFilteredProducts([]);
      return;
    }

    const filtered = products
      .filter((product) => {
        if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false;
        if (filters.metal.length > 0 && !filters.metal.includes(product.metal)) return false;
        if (filters.purity.length > 0 && !filters.purity.includes(product.purity)) return false;
        if (filters.occasion.length > 0 && !filters.occasion.includes(product.occasion)) return false;
        if (product.weight < filters.weightRange[0] || product.weight > filters.weightRange[1]) return false;

        if (filters.availability === "in_stock" && product.stock === 0) return false;
        if (filters.availability === "out_of_stock" && product.stock > 0) return false;
        if (filters.featured && !product.isFeatured) return false;
        if (filters.trending && !product.isTrending) return false;

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price_low_high":
            return a.price - b.price;
          case "price_high_low":
            return b.price - a.price;
          case "weight_low_high":
            return a.weight - b.weight;
          case "weight_high_low":
            return b.weight - a.weight;
          case "popular":
            return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
          case "newest":
          default:
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });

    setFilteredProducts(filtered);
  }, [filters, products, sortBy]);

  useEffect(() => {
    fetchCategoryProducts();
  }, [fetchCategoryProducts]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setActiveProductSlide(0);
    if (productRailRef.current) {
      productRailRef.current.scrollLeft = 0;
    }
  }, [category, filteredProducts.length, isMobileView]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleMultiSelectFilter = (filterType, value) => {
    setFilters((prev) => {
      const currentValues = prev[filterType];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [filterType]: nextValues,
      };
    });
  };

  const handleBuyNow = (product) => {
    navigate("/checkout", {
      state: {
        source: "direct",
        items: [
          {
            product: product._id,
            name: product.name,
            price: product.price,
            qty: 1,
            image: product.image,
            makingChargePercent: product.makingChargePercent || 12,
            stonePrice: product.stonePrice || 0,
            metal: product.metal,
            occasion: product.occasion,
          },
        ],
      },
    });
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCartContext(productId, 1);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const getCategoryInfo = () => {
    const activeCategory = categoryLinks.find(
      (item) => item.slug.toLowerCase() === String(category || "").toLowerCase()
    );

    if (activeCategory) {
      return {
        name: activeCategory.label,
        description: activeCategory.description,
      };
    }

    return {
      name: String(category || "Category"),
      description: "Beautiful jewellery collection tailored for every moment",
    };
  };

  const categoryInfo = getCategoryInfo();

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>Loading {categoryInfo.name}...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link to="/home" className={styles.breadcrumbLink}>
          Home
        </Link>
        <span>/</span>
        <span className={styles.breadcrumbCurrent}>{categoryInfo.name}</span>
      </div>

      <section className={styles.categoryHero}>
        <div className={styles.categoryHeroCopy}>
          <p className={styles.categoryEyebrow}>Curated Category</p>
          <h1 className={styles.categoryTitle}>{categoryInfo.name}</h1>
          <p className={styles.categoryDescription}>{categoryInfo.description}</p>
        </div>
        <div className={styles.categoryHeroMeta}>
          <div className={styles.metaCard}>
            <span>Showing</span>
            <strong>{filteredProducts.length}</strong>
            <small>designs</small>
          </div>
          <div className={styles.metaCard}>
            <span>Sort</span>
            <SelectDropdown
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: "newest", label: "Newest First" },
                { value: "price_low_high", label: "Price: Low to High" },
                { value: "price_high_low", label: "Price: High to Low" },
                { value: "popular", label: "Popular" },
                { value: "weight_low_high", label: "Weight: Low to High" },
                { value: "weight_high_low", label: "Weight: High to Low" },
              ]}
              className={styles.sortSelect}
            />
          </div>
        </div>
      </section>

      <section className={styles.horizontalFilters}>
        <div className={styles.filtersHeader}>
          <h3 className={styles.filterTitle}>Filters</h3>
          <button
            type="button"
            className={styles.clearFilters}
            onClick={() => {
              const resetFilters = {
                priceRange: [0, 2000000],
                metal: [],
                purity: [],
                occasion: [],
                weightRange: [0, 100],
                availability: "all",
                featured: false,
                trending: false,
              };
              setFilters(resetFilters);
              setPriceRange([0, 2000000]);
              setWeightRange([0, 100]);
            }}
          >
            Reset
          </button>
        </div>

        <div className={styles.horizontalFiltersGrid}>
          <div className={styles.filterBlock}>
            <label className={styles.filterLabel}>
              Price Range
              <span>Rs {priceRange[0].toLocaleString()} - Rs {priceRange[1].toLocaleString()}</span>
            </label>
            <input
              type="range"
              min="0"
              max="2000000"
              step="5000"
              value={priceRange[1]}
              onChange={(e) => {
                const newRange = [priceRange[0], Number(e.target.value)];
                setPriceRange(newRange);
                handleFilterChange("priceRange", newRange);
              }}
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterBlock}>
            <label className={styles.filterLabel}>Metal</label>
            <div className={styles.filterInlineList}>
              {metalOptions.map((metal) => (
                <label key={metal} className={styles.filterCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.metal.includes(metal)}
                    onChange={() => handleMultiSelectFilter("metal", metal)}
                    className={styles.filterCheckbox}
                  />
                  <span className={styles.filterCheckboxBox} aria-hidden="true"></span>
                  <span>{metal}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterBlock}>
            <label className={styles.filterLabel}>Purity</label>
            <div className={styles.filterInlineList}>
              {purityOptions.map((purity) => (
                <label key={purity} className={styles.filterCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.purity.includes(purity)}
                    onChange={() => handleMultiSelectFilter("purity", purity)}
                    className={styles.filterCheckbox}
                  />
                  <span className={styles.filterCheckboxBox} aria-hidden="true"></span>
                  <span>{purity}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterBlock}>
            <label className={styles.filterLabel}>Occasion</label>
            <div className={styles.filterInlineList}>
              {occasionOptions.map((occasion) => (
                <label key={occasion} className={styles.filterCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.occasion.includes(occasion)}
                    onChange={() => handleMultiSelectFilter("occasion", occasion)}
                    className={styles.filterCheckbox}
                  />
                  <span className={styles.filterCheckboxBox} aria-hidden="true"></span>
                  <span>{occasion}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterBlock}>
            <label className={styles.filterLabel}>
              Weight Range
              <span>{weightRange[0]}g - {weightRange[1]}g</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={weightRange[1]}
              onChange={(e) => {
                const newRange = [weightRange[0], Number(e.target.value)];
                setWeightRange(newRange);
                handleFilterChange("weightRange", newRange);
              }}
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterBlock}>
            <label className={styles.filterLabel}>Availability</label>
            <SelectDropdown
              value={filters.availability}
              onChange={(e) => handleFilterChange("availability", e.target.value)}
              options={[
                { value: "all", label: "All Products" },
                { value: "in_stock", label: "In Stock" },
                { value: "out_of_stock", label: "Out of Stock" },
              ]}
              className={styles.filterSelect}
            />
          </div>

          <div className={styles.filterBlock}>
            <label className={styles.filterLabel}>Collection Tags</label>
            <div className={styles.filterInlineList}>
              <label className={styles.filterCheckboxLabel}>
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => handleFilterChange("featured", e.target.checked)}
                  className={styles.filterCheckbox}
                />
                <span className={styles.filterCheckboxBox} aria-hidden="true"></span>
                <span>Featured Only</span>
              </label>
              <label className={styles.filterCheckboxLabel}>
                <input
                  type="checkbox"
                  checked={filters.trending}
                  onChange={(e) => handleFilterChange("trending", e.target.checked)}
                  className={styles.filterCheckbox}
                />
                <span className={styles.filterCheckboxBox} aria-hidden="true"></span>
                <span>Trending Only</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.mainGrid}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <p className={styles.sidebarEyebrow}>Browse Categories</p>
            <div className={styles.categoryNav}>
              {categoryLinks.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  className={`${styles.categoryNavItem} ${
                    item.slug.toLowerCase() === String(category).toLowerCase() ? styles.categoryNavItemActive : ""
                  }`}
                  onClick={() => navigate(`/category/${item.slug}`)}
                >
                  <span className={styles.categoryNavIcon} />
                  <div className={styles.categoryNavText}>
                    <strong>{item.label}</strong>
                    <span>{item.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </aside>

        <section className={styles.productsSection}>
          <div className={styles.productsTopBar}>
            <div>
              <p className={styles.productsEyebrow}>Collection Feed</p>
              <h2>{filteredProducts.length} products found</h2>
            </div>
          </div>

          <div
            className={`${styles.productGrid} ${isMobileView ? styles.mobileProductRail : ""}`}
            ref={productRailRef}
            onScroll={() => {
              if (!isMobileView || !productRailRef.current) return;
              setActiveProductSlide(
                Math.round(
                  productRailRef.current.scrollLeft / productRailRef.current.clientWidth
                )
              );
            }}
          >
            {filteredProducts.map((product) => {
              const cartItem = cart.find(
                (item) => item.product && item.product._id === product._id
              );
              const qty = cartItem?.qty || 0;
              const ratingValue = Number(product.averageRating || 0);
              const totalReviews = Number(product.totalReviews || 0);

              return (
              <article
                key={product._id}
                className={`${styles.productCard} ${isMobileView ? styles.mobileProductCard : ""}`}
              >
                <div className={styles.imageContainer}>
                  <img
                    src={`${API_BASE_URL}/uploads/${product.image}`}
                    alt={product.name}
                    className={styles.productImage}
                    onError={(e) => {
                      e.target.src = "/images/placeholder.jpg";
                    }}
                  />

                  <div className={styles.badgesContainer}>
                    {product.isNew ? <span className={`${styles.badge} ${styles.badgeNew}`}>New</span> : null}
                    {product.isTrending ? (
                      <span className={`${styles.badge} ${styles.badgeTrending}`}>Trending</span>
                    ) : null}
                  </div>

                  <WorkingWishlistHeart product={product} />
                </div>

                <div className={styles.productInfo}>
                  <div className={styles.productHeader}>
                    <div>
                      <h4 className={styles.productName}>{product.name}</h4>
                      <p className={styles.productMeta}>{product.metal} / {product.purity}</p>
                    </div>
                    <span className={styles.productWeight}>{product.weight}g</span>
                  </div>

                  <div className={styles.priceRow}>
                    <strong className={styles.productPrice}>Rs {product.price.toLocaleString("en-IN")}</strong>
                    <span
                      className={`${styles.stockStatus} ${product.stock > 0 ? styles.inStock : styles.outOfStock}`}
                    >
                      {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                    </span>
                  </div>

                  <div className={styles.ratingRow}>
                    <StarRating value={ratingValue} readonly size="small" />
                    <span className={styles.ratingText}>
                      {totalReviews > 0 ? `${ratingValue.toFixed(1)} (${totalReviews})` : "No reviews yet"}
                    </span>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={`${styles.actionButton} ${styles.buyNowButton}`}
                      onClick={() => handleBuyNow(product)}
                      disabled={product.stock === 0}
                    >
                      Buy Now
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionButton} ${styles.viewDetailsButton}`}
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      View Details
                    </button>

                    {qty === 0 ? (
                      <button
                        type="button"
                        className={`${styles.actionButton} ${styles.viewDetailsButton}`}
                        onClick={() => handleAddToCart(product._id)}
                        disabled={product.stock === 0}
                      >
                        Add To Cart
                      </button>
                    ) : (
                      <div className={styles.quantityWrap}>
                        <QuantitySelector value={qty} onChange={(newQty) => updateQty(product._id, newQty)} />
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )})}
          </div>

          {isMobileView && filteredProducts.length > 1 ? (
            <div className={styles.mobileDots} aria-label="Category products">
              {filteredProducts.map((product, index) => (
                <button
                  key={`${product._id}-dot`}
                  type="button"
                  className={`${styles.mobileDot} ${
                    activeProductSlide === index ? styles.mobileDotActive : ""
                  }`}
                  aria-label={`Go to product ${index + 1}`}
                  onClick={() => {
                    if (!productRailRef.current) return;
                    productRailRef.current.scrollTo({
                      left: productRailRef.current.clientWidth * index,
                      behavior: "smooth",
                    });
                  }}
                />
              ))}
            </div>
          ) : null}

          {filteredProducts.length === 0 ? (
            <div className={styles.noProducts}>
              <div className={styles.noProductsTitle}>No products found</div>
              <div>Try adjusting filters or switch to another category from the sidebar.</div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
