import { useState } from "react";
import type { Product } from "../types";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const ClipboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
  </svg>
);

const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 18H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v10"/>
    <path d="m14 8 4 4v4H14Z"/>
    <circle cx="6.5" cy="18.5" r="2.5"/>
    <circle cx="16.5" cy="18.5" r="2.5"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b38059" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const CoffeeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a69f9a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
    <line x1="6" x2="6" y1="2" y2="4"/>
    <line x1="10" x2="10" y1="2" y2="4"/>
    <line x1="14" x2="14" y1="2" y2="4"/>
  </svg>
);

type AnalyticsProps = {
  products: Product[];
};

export default function Analytics({ products }: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState<"pie" | "line">("pie");

  const redStock = products.filter((p) => p.quantity < 10).length;
  const yellowStock = products.filter((p) => p.quantity >= 10 && p.quantity <= 30).length;
  const greenStock = products.filter((p) => p.quantity > 30).length;
  const totalItemsCount = products.reduce((sum, p) => sum + p.quantity, 0);

  // Список товаров в пути
  const upcomingDeliveries = products
    .filter((p) => p.transport_time > 5 && p.transport_time <= 12)
    .sort((a, b) => a.transport_time - b.transport_time);

  const originGroups = products.reduce((acc: { [key: string]: number }, p) => {
    const origin = p.origin?.trim() || "Unknown";
    acc[origin] = (acc[origin] || 0) + p.quantity;
    return acc;
  }, {});

  const chartDataPie = Object.entries(originGroups).map(([name, value]) => ({
    name: name, 
    value: value,
  }));

  const chartDataLine = products.map((p) => ({
    name: p.name.length > 10 ? `${p.name.substring(0, 10)}...` : p.name,
    days: p.transport_time,
  }));

  const COLORS = ["#b38059", "#8c5a3c", "#c69c7c", "#633f24", "#d9bfa7"];

  const generateInsights = () => {
    const insights = [];
    const criticalItems = products.filter(p => p.quantity < 10).map(p => p.name);
    
    if (criticalItems.length > 0) {
      insights.push({
        type: "error",
        text: `Order Recommendation: Low stock detected for (${criticalItems.join(", ")}). Please create a new purchase order to prevent supply disruption.`,
        icon: <ClipboardIcon /> 
      });
    }

    const lowAndNotTransit = products.filter(p => p.quantity < 10 && (p.transport_time <= 5 || !p.transport_time));
    if (lowAndNotTransit.length > 0) {
      insights.push({
        type: "warning",
        text: `Logistics Warning: Some critical items have no active long-distance shipments tracked. Check your supplier communication.`,
        icon: <TruckIcon /> 
      });
    }

    return insights;
  };

  const activeInsights = generateInsights();

  return (
    <div className="analytics-page">
      <h2>Analytics & Insights</h2>

      <div className="analytics-section" style={{ marginBottom: "24px" }}>
        <h3 className="section-title">Stock Level Status</h3>
        <div className="stock-alerts-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          
          <div className="alert-card red-alert">
            <div className="alert-header">
              <span className="alert-dot"></span>
              <h4>Critical Stock</h4>
            </div>
            <p className="alert-count">{redStock}</p>
            <span className="alert-desc">Less than 10 units</span>
          </div>

          <div className="alert-card yellow-alert">
            <div className="alert-header">
              <span className="alert-dot"></span>
              <h4>Low Warning</h4>
            </div>
            <p className="alert-count">{yellowStock}</p>
            <span className="alert-desc">10 - 30 units</span>
          </div>

          <div className="alert-card green-alert">
            <div className="alert-header">
              <span className="alert-dot"></span>
              <h4>Healthy Stock</h4>
            </div>
            <p className="alert-count">{greenStock}</p>
            <span className="alert-desc">Above 30 units</span>
          </div>

          <div className="alert-card" style={{ background: "#1a1512", borderLeft: "4px solid #b38059" }}>
            <div className="alert-header">
              <span className="alert-dot" style={{ background: "#b38059" }}></span>
              <h4 style={{ color: "#d9bfa7" }}>Total Volume</h4>
            </div>
            <p className="alert-count" style={{ color: "#f5f2ef" }}>{totalItemsCount}</p>
            <span className="alert-desc" style={{ color: "#a69f9a" }}>Total units on stock</span>
          </div>

        </div>
      </div>

      <div className="analytics-double-grid" style={{ marginBottom: "24px" }}>
        
        <div className="analytics-card-block" style={{ padding: "20px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 className="section-title" style={{ margin: 0 }}>
              {activeTab === "pie" ? "Stock Shares by Origin" : "Transport Logistics Time"}
            </h3>
            
            <div style={{ display: "flex", background: "#110d0b", padding: "2px", borderRadius: "6px" }}>
              <button 
                onClick={() => setActiveTab("pie")}
                style={{ background: activeTab === "pie" ? "#b38059" : "transparent", color: activeTab === "pie" ? "#fff" : "#888", border: "none", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", cursor: "pointer", fontWeight: "600", transition: "all 0.2s" }}
              >
                Pie
              </button>
              <button 
                onClick={() => setActiveTab("line")}
                style={{ background: activeTab === "line" ? "#b38059" : "transparent", color: activeTab === "line" ? "#fff" : "#888", border: "none", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", cursor: "pointer", fontWeight: "600", transition: "all 0.2s" }}
              >
                Trends
              </button>
            </div>
          </div>
          
          {products.length === 0 ? (
            <p className="empty-text" style={{ textAlign: "center", padding: "40px 0" }}>No data to display chart.</p>
          ) : activeTab === "pie" ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", height: "160px" }}>
              <div style={{ width: "45%", height: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartDataPie} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={chartDataPie.length > 1 ? 4 : 0} dataKey="value">
                      {chartDataPie.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#1a1512" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1f1a18", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", color: "#f5f2ef" }} itemStyle={{ color: "#b38059" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ width: "55%", display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center" }}>
                {chartDataPie.slice(0, 4).map((entry, index) => {
                  const total = products.reduce((sum, p) => sum + p.quantity, 0) || 1;
                  const percentage = Math.min(Math.round((entry.value / total) * 100), 100);
                  return (
                    <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#e0e0e0" }}>
                      <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: COLORS[index % COLORS.length], flexShrink: 0 }}></span>
                      <span style={{ fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.name}:</span>
                      <span style={{ color: "#b38059", fontWeight: "bold", flexShrink: 0 }}>{entry.value} u ({percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ height: "160px", width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartDataLine} margin={{ top: 10, right: 10, left: -25, bottom: -5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888" fontSize={11} tickLine={false} unit="d" />
                  <Tooltip contentStyle={{ background: "#1f1a18", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", color: "#f5f2ef" }} itemStyle={{ color: "#b38059" }} />
                  <Line type="monotone" dataKey="days" name="Transport Time" stroke="#b38059" strokeWidth={3} dot={{ fill: "#1a1512", stroke: "#b38059", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: "#b38059" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ПРАВАЯ КАРТОЧКА: UPCOMING DELIVERIES */}
        <div className="analytics-card-block">
          <h3 className="section-title">Upcoming Deliveries</h3>
          <div className="deliveries-list">
            {upcomingDeliveries.length === 0 ? (
              <p className="empty-text">No active deliveries in transit right now.</p>
            ) : (
              upcomingDeliveries.map((product) => (
                <div key={product.id} className="delivery-item">
                  <div className="delivery-info">
                    <span className="delivery-name">{product.name}</span>
                    <span className="delivery-supplier">via {product.supplier || "Supplier"}</span>
                  </div>
                  {/* Заменили эмодзи часиков на стильную SVG иконку */}
                  <div className="delivery-time-badge" style={{ display: "flex", alignItems: "center" }}>
                    <ClockIcon /> {product.transport_time} days left
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* БЛОК 3: SMART OPERATIONS INSIGHTS */}
      <div className="analytics-section">
        <div className="analytics-card-block" style={{ padding: "20px" }}>
          <h3 className="section-title" style={{ marginBottom: "14px" }}>Smart Operations Insights</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {activeInsights.length === 0 ? (
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                padding: "14px 16px", 
                borderRadius: "8px", 
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                fontSize: "14px",
                color: "#a69f9a"
              }}>
                <CoffeeIcon />
                <p style={{ margin: 0 }}>All inventory levels are optimal. No immediate operational actions required.</p>
              </div>
            ) : (
              activeInsights.map((insight, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "12px", 
                    padding: "12px 16px", 
                    borderRadius: "8px", 
                    background: insight.type === "error" ? "rgba(239, 68, 68, 0.07)" : "rgba(245, 158, 11, 0.07)",
                    border: insight.type === "error" ? "1px solid rgba(239, 68, 68, 0.15)" : "1px solid rgba(245, 158, 11, 0.15)",
                    fontSize: "14px",
                    color: "#f5f2ef"
                  }}
                >
                  {/* Теперь здесь рендерится чистый векторный значок */}
                  <span style={{ display: "flex", alignItems: "center" }}>{insight.icon}</span>
                  <p style={{ margin: 0, lineHeight: "1.4" }}>{insight.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}