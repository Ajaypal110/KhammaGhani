import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { 
    MdShoppingBag, 
    MdAttachMoney, 
    MdRestaurant, 
    MdPeople, 
    MdDirectionsBike, 
    MdTrendingUp,
    MdEvent
} from "react-icons/md";
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

const StatCard = ({ title, value, icon: Icon, trend, trendType, color }) => (
    <div className="stat-card">
        <div className="stat-info">
            <h4>{title}</h4>
            <div className="stat-value">{value}</div>
            <div className={`stat-trend ${trendType === "up" ? "trend-up" : "trend-down"}`}>
                {trend}
            </div>
        </div>
        <div className="stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
            <Icon />
        </div>
    </div>
);

const COLORS = ["#ff6b00", "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminOverview() {
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, analyticsRes] = await Promise.all([
                API.get("/admin/stats"),
                API.get("/admin/analytics")
            ]);
            setStats(statsRes.data);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error("Dashboard data fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div className="admin-loading">Loading Dashboard Data...</div>;

    const cards = [
        { title: "Total Platform Revenue", value: `₹${stats?.totalRevenue.toLocaleString()}`, icon: MdAttachMoney, trend: "+12.5%", trendType: "up", color: "#10b981" },
        { title: "Online Payments", value: `₹${stats?.onlineRevenue.toLocaleString()}`, icon: MdAttachMoney, trend: "Razorpay", trendType: "up", color: "#3b82f6" },
        { title: "COD Collected", value: `₹${stats?.codRevenue.toLocaleString()}`, icon: MdAttachMoney, trend: "Cash", trendType: "up", color: "#f59e0b" },
        { title: "Booking Revenue", value: `₹${(stats?.bookingRevenue || 0).toLocaleString()}`, icon: MdEvent, trend: "Reservations", trendType: "up", color: "#8b5cf6" },
        { title: "Total Orders", value: stats?.totalOrders, icon: MdShoppingBag, trend: `${stats?.ordersToday} Today`, trendType: "up", color: "#ff6b00" },
        { title: "Active Restaurants", value: stats?.totalRestaurants, icon: MdRestaurant, trend: "Online", trendType: "up", color: "#ff6b00" },
    ];

    return (
        <div className="admin-overview">
            <header className="content-header">
                <div>
                    <h1>Dashboard Overview</h1>
                    <p>Welcome back! Here's what's happening on your platform today.</p>
                </div>
                <button className="primary-btn" onClick={fetchData}>Refresh Data</button>
            </header>

            <div className="stats-grid">
                {cards.map((card, i) => <StatCard key={i} {...card} />)}
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Revenue & Order Trends (Last 7 Days)</h3>
                    <div style={{ width: "100%", height: 350 }}>
                        <ResponsiveContainer>
                            <AreaChart data={analytics?.ordersTrends}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#ff6b00" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: "#64748b", fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: "#64748b", fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#ff6b00" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={0} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Order Status Distribution</h3>
                    <div style={{ width: "100%", height: 350 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={analytics?.statusDist}
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {analytics?.statusDist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
