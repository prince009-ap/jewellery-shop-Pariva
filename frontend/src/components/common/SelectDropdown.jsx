import { useEffect, useMemo, useRef, useState } from "react";
import "./SelectDropdown.css";

function SelectDropdown({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  name,
  id,
  disabled = false,
  searchable = false,
  className = "",
}) {
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuStyle, setMenuStyle] = useState({});

  const normalizedOptions = useMemo(
    () =>
      options.map((option) =>
        typeof option === "string" ? { label: option, value: option } : option
      ),
    [options]
  );

  const selectedOption = normalizedOptions.find((option) => option.value === value);

  useEffect(() => {
    setQuery(selectedOption?.label || value || "");
  }, [selectedOption, value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
        if (!searchable) {
          setQuery(selectedOption?.label || "");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchable, selectedOption]);

  useEffect(() => {
    if (!isOpen || window.innerWidth >= 768) {
      setMenuStyle({});
      return undefined;
    }

    const updateMenuPosition = () => {
      const shell = rootRef.current?.querySelector(".select-dropdown-shell");
      if (!shell) return;

      const rect = shell.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const compactWidth = viewportWidth < 768;
      const desiredWidth = compactWidth
        ? Math.min(Math.max(rect.width - 24, 128), 176)
        : rect.width;
      const maxLeft = viewportWidth - desiredWidth - 12;
      const left = Math.max(12, Math.min(rect.left, maxLeft));

      setMenuStyle({
        top: rect.bottom + 8,
        left,
        width: desiredWidth,
      });
    };

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchable) {
      return normalizedOptions;
    }

    const normalizedQuery = String(query || "").trim().toLowerCase();
    if (!normalizedQuery) {
      return normalizedOptions;
    }

    const matches = normalizedOptions.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery)
    );

    const exactMatchExists = normalizedOptions.some(
      (option) => option.label.toLowerCase() === normalizedQuery
    );

    if (!exactMatchExists && normalizedQuery) {
      return [{ label: query, value: query }, ...matches.filter((option) => option.label.toLowerCase() !== normalizedQuery)];
    }

    return matches;
  }, [normalizedOptions, query, searchable]);

  const emitChange = (nextValue) => {
    onChange({
      target: {
        name,
        id,
        value: nextValue,
        type: searchable ? "text" : "select-one",
      },
    });
  };

  const handleSelect = (option) => {
    setQuery(option.label);
    emitChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`select-dropdown ${className}`.trim()} ref={rootRef}>
      <div className={`select-dropdown-shell ${isOpen ? "is-open" : ""} ${disabled ? "is-disabled" : ""}`.trim()}>
        {searchable ? (
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="text"
            value={query}
            disabled={disabled}
            className="select-dropdown-input"
            placeholder={placeholder}
            autoComplete="off"
            onFocus={() => !disabled && setIsOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              emitChange(event.target.value);
              setIsOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setIsOpen(false);
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setIsOpen(true);
              }
            }}
          />
        ) : (
          <button
            type="button"
            id={id}
            className="select-dropdown-value"
            disabled={disabled}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {selectedOption ? selectedOption.label : <span className="select-dropdown-placeholder">{placeholder}</span>}
          </button>
        )}

        <button
          type="button"
          className="select-dropdown-toggle"
          aria-label={isOpen ? "Close dropdown" : "Open dropdown"}
          disabled={disabled}
          onClick={() => {
            setIsOpen((prev) => !prev);
            if (searchable) inputRef.current?.focus();
          }}
        >
          <span className={`select-dropdown-caret ${isOpen ? "is-open" : ""}`}>▾</span>
        </button>
      </div>

      {isOpen ? (
        <div className="select-dropdown-menu" ref={menuRef} style={menuStyle}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={`${option.value}-${option.label}`}
                type="button"
                className={`select-dropdown-option ${option.value === value ? "is-selected" : ""}`}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </button>
            ))
          ) : (
            <div className="select-dropdown-empty">No options found</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default SelectDropdown;
