import { useState, useEffect,useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import useCart from "../../context/useCart";
import QuantityCounter from "../../components/common/QuantityCounter";
import WorkingWishlistHeart from "../../components/wishlist/WorkingWishlistHeart";
import { Link } from "react-router-dom";

export default function CategoryListing() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { addToCart: addToCartContext } = useCart();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [showQuickView, setShowQuickView] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    priceRange: [0, 2000000], // Increased to accommodate expensive items like Ring (1.5M)
    metal: [],
    purity: [],
    occasion: [],
    weightRange: [0, 100],
    availability: "all",
    featured: false,
    trending: false
  });

  const [priceRange, setPriceRange] = useState([0, 2000000]); // Match the filter default
  const [weightRange, setWeightRange] = useState([0, 100]);



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
    if (!products || !Array.isArray(products)) {
      setFilteredProducts([]);
      return;
    }
    
    let filtered = [...products];

    // Apply filters
    filtered = filtered.filter(product => {
      // Price filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      // Metal filter
      if (filters.metal.length > 0 && !filters.metal.includes(product.metal)) {
        return false;
      }

      // Purity filter
      if (filters.purity.length > 0 && !filters.purity.includes(product.purity)) {
        return false;
      }

      // Occasion filter
      if (filters.occasion.length > 0 && !filters.occasion.includes(product.occasion)) {
        return false;
      }

      // Weight filter
      if (product.weight < filters.weightRange[0] || product.weight > filters.weightRange[1]) {
        return false;
      }

      // Availability filter
      if (filters.availability !== "all") {
        if (filters.availability === "in_stock" && product.stock === 0) {
          return false;
        }
        if (filters.availability === "out_of_stock" && product.stock > 0) {
          return false;
        }
      }

      // Featured filter
      if (filters.featured && !product.isFeatured) {
        return false;
      }

      // Trending filter
      if (filters.trending && !product.isTrending) {
        return false;
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_low_high":
          return a.price - b.price;
        case "price_high_low":
          return b.price - a.price;
        case "weight_low_high":
          return a.weight - b.weight;
        case "weight_high_low":
          return b.weight - a.weight;
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "popular":
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, filters, sortBy]);
 useEffect(() => {
  fetchCategoryProducts();
}, [fetchCategoryProducts]);

 useEffect(() => {
  applyFiltersAndSort();
}, [applyFiltersAndSort]);
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleMultiSelectFilter = (filterType, value) => {
    setFilters(prev => {
      const currentValues = prev[filterType];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [filterType]: currentValues.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [filterType]: [...currentValues, value]
        };
      }
    });
  };


  const getCategoryInfo = () => {
    const categoryInfo = {
      neckles: {
        name: "NECKLACES",
        description: "Elegant necklaces crafted with precision and love",
        image: "/images/categories/necklaces.jpg"
      },
      ring: {
        name: "RINGS",
        description: "Beautiful rings for every occasion",
        image: "/images/categories/rings.jpg"
      },
      bracelet: {
        name: "BRACELETS",
        description: "Stunning bracelets to adorn your wrists",
        image: "/images/categories/bracelets.jpg"
      },
      pandent: {
        name: "PENDANTS",
        description: "Exquisite pendants that capture attention",
        image: "/images/categories/pendants.jpg"
      }
    };
    
    return categoryInfo[category] || {
      name: category.toUpperCase(),
      description: "Beautiful jewellery collection",
      image: "/images/categories/default.jpg"
    };
  };

  const categoryInfo = getCategoryInfo();

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div>Loading {categoryInfo.name}...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ padding: "1rem 2rem", fontSize: "0.875rem", color: "#6b7280" }}>
         <div style={{ padding: "1rem 2rem", fontSize: "0.875rem", color: "#6b7280" }}>
  <Link to="/home" style={{ textDecoration: "none", color: "#6b7280" }}>
    Home
  </Link>

  {" → "}

  <Link 
    to={`/category/${categoryInfo.name}`} 
    style={{ textDecoration: "none", color: "#6b7280" }}
  >
    {categoryInfo.name}
  </Link>
</div>
       
      </div>

      {/* Category Header */}
      <div style={{
        background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)",
        padding: "3rem 2rem",
        textAlign: "center",
        color: "white",
        marginBottom: "2rem"
      }}>
        <h1 style={{ fontSize: "2.5rem", margin: "0 0 1rem 0", textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
          {categoryInfo.name}
        </h1>
        <p style={{ fontSize: "1.125rem", margin: "0 0 0.5rem 0", opacity: 0.95 }}>
          {categoryInfo.description}
        </p>
        <p style={{ fontSize: "1rem", margin: 0, opacity: 0.9 }}>
          Showing {filteredProducts.length} designs
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "2rem", padding: "0 2rem 2rem" }}>
        {/* Left Sidebar - Filters */}
        <div style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          height: "fit-content",
          position: "sticky",
          top: "2rem"
        }}>
          <h3 style={{ margin: "0 0 1.5rem 0", color: "#111827", fontSize: "1.125rem" }}>Filters</h3>
          
          {/* Price Range */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontWeight: "500" }}>
              Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
            </label>
            <input
              type="range"
              min="0"
              max="500000"
              step="5000"
              value={priceRange[1]}
              onChange={(e) => {
                const newRange = [priceRange[0], parseInt(e.target.value)];
                setPriceRange(newRange);
                handleFilterChange("priceRange", newRange);
              }}
              style={{ width: "100%", marginBottom: "0.5rem" }}
            />
          </div>

          {/* Metal */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontWeight: "500" }}>
              Metal
            </label>
            {["Gold", "Silver"].map(metal => (
              <label key={metal} style={{ display: "block", marginBottom: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={filters.metal.includes(metal)}
                  onChange={() => handleMultiSelectFilter("metal", metal)}
                  style={{ marginRight: "0.5rem" }}
                />
                {metal}
              </label>
            ))}
          </div>

          {/* Purity */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontWeight: "500" }}>
              Purity
            </label>
            {["22K", "18K", "14K"].map(purity => (
              <label key={purity} style={{ display: "block", marginBottom: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={filters.purity.includes(purity)}
                  onChange={() => handleMultiSelectFilter("purity", purity)}
                  style={{ marginRight: "0.5rem" }}
                />
                {purity}
              </label>
            ))}
          </div>

          {/* Occasion */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontWeight: "500" }}>
              Occasion
            </label>
            {["Wedding", "Daily Wear", "Party"].map(occasion => (
              <label key={occasion} style={{ display: "block", marginBottom: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={filters.occasion.includes(occasion)}
                  onChange={() => handleMultiSelectFilter("occasion", occasion)}
                  style={{ marginRight: "0.5rem" }}
                />
                {occasion}
              </label>
            ))}
          </div>

          {/* Weight Range */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontWeight: "500" }}>
              Weight Range: {weightRange[0]}g - {weightRange[1]}g
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={weightRange[1]}
              onChange={(e) => {
                const newRange = [weightRange[0], parseInt(e.target.value)];
                setWeightRange(newRange);
                handleFilterChange("weightRange", newRange);
              }}
              style={{ width: "100%", marginBottom: "0.5rem" }}
            />
          </div>

          {/* Availability */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontWeight: "500" }}>
              Availability
            </label>
            <select
              value={filters.availability}
              onChange={(e) => handleFilterChange("availability", e.target.value)}
              style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
            >
              <option value="all">All Products</option>
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          {/* Featured/Trending */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={(e) => handleFilterChange("featured", e.target.checked)}
                style={{ marginRight: "0.5rem" }}
              />
              Featured Only
            </label>
            <label style={{ display: "block", marginBottom: "0.5rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={filters.trending}
                onChange={(e) => handleFilterChange("trending", e.target.checked)}
                style={{ marginRight: "0.5rem" }}
              />
              Trending Only
            </label>
          </div>
        </div>

        {/* Right Side - Products */}
        <div>
          {/* Sorting */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div style={{ color: "#6b7280" }}>
              {filteredProducts.length} products found
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                background: "white"
              }}
            >
              <option value="newest">Newest First</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
              <option value="popular">Popular</option>
              <option value="weight_low_high">Weight: Low to High</option>
              <option value="weight_high_low">Weight: High to Low</option>
            </select>
          </div>

          {/* Product Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem"
          }}>
            {filteredProducts.map(product => (
              <div
                key={product._id}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                }}
              >
                {/* Product Image */}
                <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
                  <img
                    src={`http://localhost:5000/uploads/${product.image}`}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                    onError={(e) => {
                      e.target.src = "/images/placeholder.jpg";
                    }}
                  />
                  
                  {/* Badges */}
                  <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", gap: "0.5rem" }}>
                    {product.isNew && (
                      <span style={{
                        background: "#10b981",
                        color: "white",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: "500"
                      }}>
                        NEW
                      </span>
                    )}
                    {product.isTrending && (
                      <span style={{
                        background: "#f59e0b",
                        color: "white",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: "500"
                      }}>
                        TRENDING
                      </span>
                    )}
                  </div>

                  {/* Wishlist Icon */}
                  <WorkingWishlistHeart product={product} />
                </div>

                {/* Product Info */}
                <div style={{ padding: "1rem" }}>
                  <h4 style={{ margin: "0 0 0.5rem 0", color: "#111827", fontSize: "1rem", lineHeight: "1.4" }}>
                    {product.name}
                  </h4>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ color: "#d4af37", fontSize: "1.25rem", fontWeight: "600" }}>
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                      {product.weight}g
                    </span>
                  </div>
                  
                  <div style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1rem" }}>
                    {product.metal} • {product.purity}
                  </div>

                  {/* Stock Status */}
                  <div style={{ marginBottom: "1rem" }}>
                    {product.stock > 0 ? (
                      <span style={{ color: "#059669", fontSize: "0.875rem" }}>
                        ✓ In Stock ({product.stock} available)
                      </span>
                    ) : (
                      <span style={{ color: "#dc2626", fontSize: "0.875rem" }}>
                        ✗ Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowQuickView(product);
                      }}
                      style={{
                        flex: 1,
                        padding: "0.5rem",
                        border: "1px solid #d4af37",
                        background: "white",
                        color: "#d4af37",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: "500"
                      }}
                    >
                      Quick View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product._id}`);
                      }}
                      style={{
                        flex: 1,
                        padding: "0.5rem",
                        border: "none",
                        background: "#d4af37",
                        color: "white",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: "500"
                      }}
                    >
                      View Details
                    </button>
                  </div>

                  {/* Quantity Counter */}
                  <div style={{ marginTop: "1rem" }}>
                    <QuantityCounter
                      productId={product._id}
                      initialQuantity={0}
                      onQuantityChange={(productId, quantity) => {
                        if (quantity === 0) {
                          // Remove from cart if quantity is 0
                          // This is handled by the cart context
                        } else {
                          // Add to cart with specified quantity
                          for (let i = 0; i < quantity; i++) {
                            addToCartContext(productId, 1);
                          }
                        }
                      }}
                      size="small"
                      disabled={product.stock === 0}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Products Found */}
          {filteredProducts.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
              <div style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>No products found</div>
              <div>Try adjusting your filters or browse our other categories</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}
          onClick={() => setShowQuickView(null)}
        >
          <div style={{
            background: "white",
            borderRadius: "12px",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "90vh",
            overflow: "auto",
            position: "relative"
          }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowQuickView(null)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "white",
                border: "1px solid #d1d5db",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 1
              }}
            >
              ✕
            </button>

            {/* Quick View Content */}
            <div style={{ padding: "2rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                {/* Product Image */}
                <div>
                  <img
                    src={`http://localhost:5000/uploads/${showQuickView.image}`}
                    alt={showQuickView.name}
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      aspectRatio: "1",
                      objectFit: "cover"
                    }}
                    onError={(e) => {
                      e.target.src = "/images/placeholder.jpg";
                    }}
                  />
                </div>

                {/* Product Details */}
                <div>
                  <h3 style={{ margin: "0 0 1rem 0", color: "#111827" }}>
                    {showQuickView.name}
                  </h3>
                  
                  <div style={{ fontSize: "1.5rem", color: "#d4af37", fontWeight: "600", marginBottom: "1rem" }}>
                    ₹{showQuickView.price.toLocaleString()}
                  </div>
                  
                  <div style={{ display: "grid", gap: "0.5rem", marginBottom: "1rem" }}>
                    <div><strong>Metal:</strong> {showQuickView.metal}</div>
                    <div><strong>Purity:</strong> {showQuickView.purity}</div>
                    <div><strong>Weight:</strong> {showQuickView.weight} grams</div>
                    <div><strong>Occasion:</strong> {showQuickView.occasion}</div>
                    <div><strong>Stock:</strong> {showQuickView.stock > 0 ? `${showQuickView.stock} available` : "Out of stock"}</div>
                  </div>
                  
                  {showQuickView.shortDescription && (
                    <div style={{ marginBottom: "1rem", color: "#6b7280" }}>
                      {showQuickView.shortDescription}
                    </div>
                  )}
                  
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <QuantityCounter
                      productId={showQuickView._id}
                      initialQuantity={0}
                      onQuantityChange={(productId, quantity) => {
                        if (quantity === 0) {
                          // Remove from cart if quantity is 0
                          // This is handled by cart context
                        } else {
                          // Add to cart with specified quantity
                          for (let i = 0; i < quantity; i++) {
                            addToCartContext(productId, 1);
                          }
                        }
                      }}
                      disabled={showQuickView.stock === 0}
                    />
                    <button
                      onClick={() => {
                        navigate(`/product/${showQuickView._id}`);
                        setShowQuickView(null);
                      }}
                      style={{
                        flex: 1,
                        padding: "0.75rem",
                        border: "1px solid #d4af37",
                        background: "white",
                        color: "#d4af37",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "1rem",
                        fontWeight: "500"
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
