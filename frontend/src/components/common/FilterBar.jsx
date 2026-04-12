// src/components/common/FilterBar.js
import React from "react";
import { MdSearch, MdTune, MdDiamond, MdAutoAwesome } from "react-icons/md";
import SelectDropdown from "./SelectDropdown";

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
  <span className="search-group-icon" aria-hidden="true">
    <MdSearch size={22} />
  </span>
  <input
    type="search"
    placeholder="Search for diamond jewellery"
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
            <span className="filter-pill-icon" aria-hidden="true">
              <MdTune size={16} />
            </span>
            <SelectDropdown
              value={priceRange}
              onChange={(e) => onPriceChange(e.target.value)}
              options={PRICE_RANGES.map((range) => ({ value: range.value, label: range.label }))}
              placeholder="Any"
            />
          </FilterPill>
          <FilterPill label="Metal">
            <span className="filter-pill-icon" aria-hidden="true">
              <MdDiamond size={16} />
            </span>
            <SelectDropdown
              value={metal}
              onChange={(e) => onMetalChange(e.target.value)}
              options={[{ value: "", label: "Any" }, ...metals.map((m) => ({ value: m, label: m }))]}
              placeholder="Any"
            />
          </FilterPill>
          <FilterPill label="Occasion">
            <span className="filter-pill-icon" aria-hidden="true">
              <MdAutoAwesome size={16} />
            </span>
            <SelectDropdown
              value={occasion}
              onChange={(e) => onOccasionChange(e.target.value)}
              options={[{ value: "", label: "Any" }, ...occasions.map((o) => ({ value: o, label: o }))]}
              placeholder="Any"
            />
          </FilterPill>
          <FilterPill label="Sort">
            <span className="filter-pill-icon" aria-hidden="true">
              <MdTune size={16} />
            </span>
            <SelectDropdown
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              options={SORT_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
            />
          </FilterPill>
        </div>
      </div>
    </section>
  );
}

export default FilterBar;
