import { useEffect, useMemo, useRef, useState } from "react";
import { MdCalendarMonth, MdChevronLeft, MdChevronRight } from "react-icons/md";
import "./DatePicker.css";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseDateValue(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value) {
  const date = parseDateValue(value);
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function buildCalendarDays(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export default function DatePicker({
  value = "",
  onChange,
  name,
  id,
  placeholder = "dd-mm-yyyy",
}) {
  const rootRef = useRef(null);
  const selectedDate = useMemo(() => parseDateValue(value), [value]);
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(selectedDate || new Date());

  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const monthLabel = viewDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const emitChange = (nextValue) => {
    onChange?.({
      target: {
        name,
        id,
        value: nextValue,
        type: "date",
      },
    });
  };

  const selectDate = (date) => {
    emitChange(formatDateValue(date));
    setIsOpen(false);
  };

  const clearDate = () => {
    emitChange("");
    setIsOpen(false);
  };

  const today = () => {
    const now = new Date();
    setViewDate(now);
    selectDate(now);
  };

  const displayedValue = formatDisplayDate(value);
  const todayValue = formatDateValue(new Date());

  return (
    <div className="date-picker" ref={rootRef}>
      <button
        type="button"
        id={id}
        className={`date-picker-trigger ${isOpen ? "is-open" : ""}`}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className={`date-picker-trigger-text ${displayedValue ? "" : "is-placeholder"}`}>
          {displayedValue || placeholder}
        </span>
        <MdCalendarMonth size={20} className="date-picker-trigger-icon" />
      </button>

      {isOpen ? (
        <div className="date-picker-panel">
          <div className="date-picker-head">
            <div className="date-picker-title">{monthLabel}</div>
            <div className="date-picker-nav">
              <button
                type="button"
                className="date-picker-nav-btn"
                aria-label="Previous month"
                onClick={() =>
                  setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
                }
              >
                <MdChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="date-picker-nav-btn"
                aria-label="Next month"
                onClick={() =>
                  setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
                }
              >
                <MdChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="date-picker-weekdays">
            {WEEKDAYS.map((day) => (
              <div key={day} className="date-picker-weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="date-picker-grid">
            {calendarDays.map((date) => {
              const cellValue = formatDateValue(date);
              const isSelected = cellValue === value;
              const isOutside = date.getMonth() !== viewDate.getMonth();
              const isToday = cellValue === todayValue;

              return (
                <button
                  key={cellValue}
                  type="button"
                  className={`date-picker-day ${isSelected ? "is-selected" : ""} ${
                    isOutside ? "is-outside" : ""
                  } ${isToday ? "is-today" : ""}`}
                  onClick={() => selectDate(date)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="date-picker-actions">
            <button type="button" className="date-picker-action" onClick={clearDate}>
              Clear
            </button>
            <button type="button" className="date-picker-action" onClick={today}>
              Today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
