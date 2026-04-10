import { useEffect, useMemo, useRef, useState } from "react";

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  name,
  required = false,
}) {
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || "");

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = String(query || "").trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    const matched = options.filter((option) => option.toLowerCase().includes(normalizedQuery));
    const exactMatchExists = options.some((option) => option.toLowerCase() === normalizedQuery);

    if (!exactMatchExists && normalizedQuery) {
      return [query, ...matched.filter((option) => option.toLowerCase() !== normalizedQuery)];
    }

    return matched;
  }, [options, query]);

  const selectOption = (option) => {
    setQuery(option);
    onChange({
      target: {
        name,
        value: option,
        type: "text",
      },
    });
    setIsOpen(false);
  };

  return (
    <div className="searchable-select" ref={rootRef}>
      <div className={`searchable-select-shell ${isOpen ? "is-open" : ""}`}>
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            onChange(event);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setIsOpen(true);
            }

            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          className="searchable-select-input"
          placeholder={placeholder}
          autoComplete="off"
          required={required}
        />
        <button
          type="button"
          className="searchable-select-toggle"
          aria-label={isOpen ? "Close category list" : "Open category list"}
          onClick={() => {
            setIsOpen((prev) => !prev);
            inputRef.current?.focus();
          }}
        >
          <span className={`searchable-select-caret ${isOpen ? "is-open" : ""}`}>▾</span>
        </button>
      </div>

      {isOpen ? (
        <div className="searchable-select-menu">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`searchable-select-option ${option === value ? "is-selected" : ""}`}
                onClick={() => selectOption(option)}
              >
                {option}
              </button>
            ))
          ) : (
            <div className="searchable-select-empty">No matching category</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default SearchableSelect;
