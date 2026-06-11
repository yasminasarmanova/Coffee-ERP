import { useState } from "react";
import type { Product } from "../types";

type LogisticsProps = {
  products: Product[];
  onUpdateProduct: (id: number, updates: Partial<Product>) => Promise<void>;
};

export default function Logistics({ products, onUpdateProduct }: LogisticsProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [orderQuantity, setOrderQuantity] = useState<number>(20);
  const [transitDays, setTransitDays] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const today = new Date();
  
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); 
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());

  // Month names for the calendar header
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const inTransitCount = products.filter(p => p.delivery_status === "In Transit" && p.transport_time > 1).length;
  const todayCount = products.filter(p => p.delivery_status === "In Transit" && p.transport_time === 1).length;

  const overdueCount = products.filter(p => {
  if (p.delivery_status !== "In Transit") return false;

  const arrivalDate = new Date();
  arrivalDate.setDate(today.getDate() + p.transport_time);

  return arrivalDate < new Date();
}).length;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const shiftIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const blanks = Array.from({ length: shiftIndex }, (_, i) => i);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Find shipments for a specific date (day/month/year)
  const getProductsForDate = (day: number, month: number, year: number) => {
    return products.filter(p => {
      if (p.delivery_status !== "In Transit") return false;

      const arrivalDate = new Date();
      arrivalDate.setDate(today.getDate() + p.transport_time);

      return (
        arrivalDate.getDate() === day &&
        arrivalDate.getMonth() === month &&
        arrivalDate.getFullYear() === year
      );
    });
  };

const handleReceiveShipment = async (product: Product) => {
  try {
    await onUpdateProduct(product.id, {
      delivery_status: "Delivered",
      transport_time: 0 
    });
    alert("Shipment successfully received!");
  } catch (error: any) {
    alert(`Error: ${error?.message}`);
  }
};

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    setIsSubmitting(true);
    try {
      const product = products.find(p => p.id === Number(selectedProductId));
      
      if (product) {
        await onUpdateProduct(product.id, {
          quantity: product.quantity + Number(orderQuantity),
          transport_time: Number(transitDays),
          delivery_status: "In Transit"
        });
        alert("Purchase order successfully placed!");
        setSelectedProductId("");
      }
    } catch (error: any) {
      console.error(error);
      alert(`Error creating order: ${error?.message || "Check your database connection"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Products linked to the clicked calendar day
  const selectedDateProducts = getProductsForDate(selectedDay, currentMonth, currentYear);

  return (
    <div className="page" style={{ padding: "0" }}>
      <h2>Logistics Dashboard</h2>

      {/* TOP STATUS CARDS */}
      <div className="stats" style={{ marginBottom: "24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        <div className="card" style={{ borderLeft: "4px solid #b38059" }}>
          <h3>In Transit</h3>
          <p>{inTransitCount}</p>
        </div>
        <div className="card" style={{ borderLeft: "4px solid #ff9f43" }}>
          <h3>Arriving Today</h3>
          <p style={{ color: "#ff9f43" }}>{todayCount}</p>
        </div>
        <div className="card" style={{ borderLeft: "4px solid #ff4d4d" }}>
          <h3>Overdue</h3>
          <p style={{ color: "#ff4d4d" }}>{overdueCount}</p>
        </div>
      </div>

      {/* MAIN SECTION */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* DYNAMIC TWO-COLUMN CALENDAR & DETAILS BLOCK */}
        <div className="inventory-wrapper" style={{ 
          display: "grid", 
          gridTemplateColumns: "1.1fr 0.9fr", 
          background: "#110d0b", 
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.02)"
        }}>
          
          {/* INTERACTIVE CALENDAR WITH MONTH SWITCHING */}
          <div style={{ padding: "24px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <button onClick={handlePrevMonth} style={{ background: "transparent", border: "none", color: "#b38059", fontSize: "18px", cursor: "pointer", fontWeight: "bold" }}>&larr;</button>
              <h3 style={{ margin: 0, color: "#b38059", fontSize: "18px" }}>
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button onClick={handleNextMonth} style={{ background: "transparent", border: "none", color: "#b38059", fontSize: "18px", cursor: "pointer", fontWeight: "bold" }}>&rarr;</button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", textAlign: "center" }}>
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(w => (
                <span key={w} style={{ fontSize: "11px", color: "#a69f9a", fontWeight: "600", marginBottom: "6px" }}>{w}</span>
              ))}

              {/* Blank cells for month alignment */}
              {blanks.map(b => (
                <div key={`blank-${b}`} style={{ padding: "10px 0" }}></div>
              ))}

              {/* Real days of the month */}
              {calendarDays.map(day => {
                const dayProducts = getProductsForDate(day, currentMonth, currentYear);
                const hasDeliveries = dayProducts.length > 0;
                const isSelected = day === selectedDay;
                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      padding: "10px 0",
                      background: isSelected ? "#b38059" : isToday ? "rgba(255,255,255,0.05)" : "#0a0706",
                      color: isSelected ? "#fff" : isToday ? "#ff9f43" : "#f5f2ef",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: isToday || isSelected ? "bold" : "normal",
                      border: isToday ? "1px solid #ff9f43" : "1px solid rgba(255,255,255,0.01)",
                      position: "relative"
                    }}
                  >
                    {day}
                    {hasDeliveries && !isSelected && (
                      <span style={{
                        position: "absolute",
                        bottom: "3px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "4px",
                        height: "4px",
                        background: isToday ? "#ff9f43" : "#b38059",
                        borderRadius: "50%"
                      }}></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* DELIVERY DETAILS FOR THE SELECTED DATE */}
          <div style={{ padding: "24px", background: "rgba(255,255,255,0.01)", height: "100%", display: "flex", flexDirection: "column" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#b38059", fontSize: "18px" }}>Delivery Details</h3>
            
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
              {selectedDateProducts.length === 0 ? (
                <div style={{ margin: "auto 0", textAlign: "center", color: "#a69f9a", fontSize: "14px" }}>
                  📦 No scheduled deliveries for {monthNames[currentMonth]} {selectedDay}.
                </div>
              ) : (
                selectedDateProducts.map(product => (
                  <div key={product.id} style={{ background: "#0a0706", padding: "14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.03)" }}>
                    <div style={{ fontWeight: "700", color: "#f5f2ef", fontSize: "16px", marginBottom: "4px" }}>
                      {product.name}
                    </div>
                    <div style={{ color: "#b38059", fontWeight: "600", fontSize: "14px", marginBottom: "12px" }}>
                      {product.quantity} kg / pcs
                    </div>
                    
                    <div style={{ fontSize: "13px", color: "#a69f9a", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div>• Supplier: <span style={{ color: "#f5f2ef" }}>{product.supplier}</span></div>
                      <div>• Status: <span style={{ color: "#ff9f43", fontWeight: "600" }}>{product.delivery_status}</span></div>
                      <div>• ETA: <span style={{ color: "#10b981", fontWeight: "600" }}>14:30</span></div>
                    </div>

                    <button
                      onClick={() => handleReceiveShipment(product)}
                      style={{
                        background: "#b38059",
                        color: "#fff",
                        border: "none",
                        width: "100%",
                        padding: "8px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        cursor: "pointer",
                        fontWeight: "600",
                        marginTop: "14px"
                      }}
                    >
                      Receive to Stock
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* ORDER CREATION FORM */}
        <div style={{ padding: "20px", background: "#110d0b", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.02)" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#b38059" }}>+ Create Order</h3>
          
          <form onSubmit={handleCreateOrder} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "12px", color: "#a69f9a" }}>Ingredient</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
                style={{ background: "#0a0706", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "10px", color: "#f5f2ef", outline: "none" }}
              >
                <option value="">-- Select --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "12px", color: "#a69f9a" }}>Order Volume</label>
              <input
                type="number"
                min="1"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(Number(e.target.value))}
                required
                style={{ background: "#0a0706", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "10px", color: "#f5f2ef", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "12px", color: "#a69f9a" }}>Transit Days</label>
              <input
                type="number"
                min="1"
                value={transitDays}
                onChange={(e) => setTransitDays(Number(e.target.value))}
                required
                style={{ background: "#0a0706", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "10px", color: "#f5f2ef", outline: "none" }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{ background: "transparent", border: "1px solid #b38059", color: "#b38059", padding: "10px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", marginTop: "8px" }}
            >
              {isSubmitting ? "Submitting..." : "Place Shipment Order"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}


