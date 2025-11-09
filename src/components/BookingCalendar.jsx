import React, { useState, useCallback, useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./BookingCalendar.css";
import BookingModal from "./BookingModal";

const localizer = momentLocalizer(moment);

// Bỏ prop 'selectedDate' vì nó không được dùng
const BookingCalendar = () => {
  // Dùng useMemo để 'today' chỉ được tính 1 lần
  const today = useMemo(() => new Date(), []);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Dữ liệu mock
  const [events] = useState([
    {
      id: 1,
      title: "Available",
      start: new Date(2025, 10, 9, 9, 0), // Nov 9, 2025 at 9:00 AM
      end: new Date(2025, 10, 9, 10, 0),
      type: "available",
    },
    {
      id: 2,
      title: "Booked",
      start: new Date(2025, 10, 9, 14, 0), // Nov 9, 2025 at 2:00 PM
      end: new Date(2025, 10, 9, 15, 0),
      type: "booked",
    },
  ]);

  const handleSelectSlot = useCallback(
    (slotInfo) => {
      const clickedDate = slotInfo.start;
      const isToday = clickedDate.toDateString() === today.toDateString();

      if (isToday) {
        setSelectedDate(clickedDate);
        setShowModal(true);
      } else {
        alert(
          "Tính năng đặt trước chưa khả dụng. Hiện tại chỉ cho phép đặt lịch trong ngày hôm nay."
        );
      }
    },
    [today]
  );

  const handleSelectEvent = useCallback((event) => {
    console.log("Selected event:", event);
  }, []);

  // Custom style cho sự kiện (event)
  const eventStyleGetter = (event) => {
    let backgroundColor = "#3b82f6"; // default blue
    let color = "white";

    if (event.type === "available") {
      backgroundColor = "#22c55e"; // green
    } else if (event.type === "booked") {
      backgroundColor = "#ef4444"; // red
    }

    return {
      style: {
        backgroundColor,
        color,
        borderRadius: "6px",
        border: "none",
        padding: "4px 8px",
        fontSize: "0.875rem",
        fontWeight: "600",
      },
    };
  };

  // Custom prop cho ngày, dùng class CSS và thêm icon ngôi sao
  const dayPropGetter = useCallback(
    (date) => {
      const isToday = date.toDateString() === today.toDateString();

      if (!isToday) {
        return {
          className: "rbc-day-disabled",
        };
      }
      return {
        className: "rbc-day-today-bookable",
      };
    },
    [today]
  );

  // Custom component để hiển thị số ngày với icon ngôi sao
  const DateCellWrapper = ({ value, children }) => {
    const isToday = value.toDateString() === today.toDateString();

    return (
      <div className="rbc-date-cell-wrapper">
        {isToday && <i className="bi bi-star-fill star-icon"></i>}
        {children}
      </div>
    );
  };

  return (
    <div className="calendar-page-wrapper">
      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          views={["month"]}
          defaultView="month"
          defaultDate={today}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayPropGetter}
          popup
          toolbar={false}
          components={{
            dateCellWrapper: DateCellWrapper,
          }}
        />
      </div>

      <BookingModal
        show={showModal}
        onClose={() => setShowModal(false)}
        selectedDate={selectedDate}
      />

      <style jsx>{`
        .star-icon {
          position: absolute;
          top: 4px;
          right: 4px;
          font-size: 1rem;
          color: #fbbf24;
          animation: sparkle 2s infinite;
          z-index: 10;
        }

        @keyframes sparkle {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(1.2) rotate(15deg);
            opacity: 0.8;
          }
        }

        .rbc-date-cell-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .rbc-day-today-bookable {
          background: #fff8e1 !important;
          cursor: pointer;
        }

        .rbc-day-today-bookable:hover {
          background: #ffecb3 !important;
        }

        .rbc-day-disabled {
          background: #fafafa;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default BookingCalendar;
