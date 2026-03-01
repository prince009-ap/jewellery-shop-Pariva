// src/components/common/FilterBar.js
import React from "react";

const PRICE_RANGES = [
  { label: "Any", value: "" },
  { label: "Under ₹25,000", value: "0-25000" },
  { label: "₹25,000 – ₹50,000", value: "25000-50000" },
  { label: "₹50,000 – ₹1,00,000", value: "50000-100000" },
  { label: "Above ₹1,00,000", value: "100000-9999999" },
];

const SORT_OPTIONS = [
  { label: "Relevance", value: "relevance" },
  { label: "Popularity", value: "popularity" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

function FilterPill({ label, children }) {
  return (
    <div className="filter-pill">
      <span className="filter-label">{label}</span>
      <div className="filter-control">{children}</div>
    </div>
  );
}



function FilterBar({
   search,
  onSearchChange,
  showSuggestions,
  suggestions,
  onSuggestionClick,
  searchRef,
  priceRange,
  onPriceChange,
  metal,
  onMetalChange,
  occasion,
  onOccasionChange,
  sort,
  onSortChange,
  metals,
  occasions,
}) {

  return (
    <section className="search-filter" id="search" aria-label="Search and Filters">
      <div className="search-filter-inner">
 <div className="search-group" ref={searchRef}>
  <input
    type="search"
    placeholder="Search for rings, necklaces, collections or gifts"
    value={search}
    onChange={(e) => onSearchChange(e.target.value)}
    onFocus={() => search && onSearchChange(search)}
  />

  {showSuggestions && suggestions.length > 0 && (
    <div className="search-suggestions">
      {suggestions.map((item) => (
        <div
          key={item._id}
          className="suggestion-item"
          onClick={() => onSuggestionClick(item.name)}
        >
          🔍 {item.name}
          <span className="suggestion-category">
            in {item.category}
          </span>
        </div>
      ))}
    </div>
  )}
</div>




        <div className="filters-group">
          <FilterPill label="Price">
            <div className="select-shell">
              <select
                value={priceRange}
                onChange={(e) => onPriceChange(e.target.value)}
              >
                {PRICE_RANGES.map((range) => (
                  <option key={range.label} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </FilterPill>
          <FilterPill label="Metal">
            <div className="select-shell">
              <select value={metal} onChange={(e) => onMetalChange(e.target.value)}>
                <option value="">Any</option>
                {metals.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </FilterPill>
          <FilterPill label="Occasion">
            <div className="select-shell">
              <select
                value={occasion}
                onChange={(e) => onOccasionChange(e.target.value)}
              >
                <option value="">Any</option>
                {occasions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </FilterPill>
          <FilterPill label="Sort">
            <div className="select-shell">
              <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </FilterPill>
        </div>
      </div>
    </section>
  );
}

export default FilterBar;