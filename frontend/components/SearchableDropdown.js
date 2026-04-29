import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Searchable dropdown with typeahead. Shows flag/icon, name, and optional city.
 *
 * Props:
 *   items: Array of { name, city?, flag? }
 *   value: currently selected item name (string) or null
 *   onChange: (item) => void
 *   placeholder: string
 *   renderFlag: optional (item) => React.node for custom left icon
 *   disabled: boolean
 *   id: string         — for HTML id attribute
 */
export default function SearchableDropdown({
  items = [],
  value,
  onChange,
  placeholder = "Search…",
  renderFlag,
  disabled,
  id,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIdx, setHighlightIdx] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Filter items by query
  const filtered = items.filter((it) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      it.name.toLowerCase().includes(q) ||
      (it.city && it.city.toLowerCase().includes(q))
    );
  });

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset highlight index when filtered list changes
  useEffect(() => {
    setHighlightIdx(0);
  }, [filtered.length, query]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (open && listRef.current) {
      const highlighted = listRef.current.children[highlightIdx];
      if (highlighted) {
        highlighted.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightIdx, open]);

  const handleSelect = useCallback(
    (item) => {
      onChange(item);
      setQuery("");
      setOpen(false);
    },
    [onChange]
  );

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIdx((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[highlightIdx]) {
          handleSelect(filtered[highlightIdx]);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  };

  const displayText = value ? value : "";

  return (
    <div className="ob-search-dropdown" ref={wrapperRef}>
      <div className="ob-search-input-wrapper">
        <input
          id={id}
          className="ob-input"
          type="text"
          value={open ? query : displayText}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoComplete="off"
        />
        <span className={`ob-search-chevron ${open ? "open" : ""}`}>▾</span>
      </div>

      {open && (
        <div className="ob-dropdown-list" ref={listRef}>
          {filtered.length === 0 ? (
            <div className="ob-dropdown-empty">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item, i) => (
              <button
                key={item.name}
                className={`ob-dropdown-item ${i === highlightIdx ? "highlighted" : ""}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightIdx(i)}
                type="button"
              >
                <span className="ob-dropdown-flag">
                  {renderFlag ? renderFlag(item) : item.flag || "🏫"}
                </span>
                <span className="ob-dropdown-name">{item.name}</span>
                {item.city && (
                  <span className="ob-dropdown-city">{item.city}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
