import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

const COLORS = ["#ff6b00", "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6366f1"];

export default function AdminAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await API.get("/admin/analytics");
                setAnalytics(res.data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="admin-loading">Analyzing Platform Data...</div>;

    return (
        <div className="admin-page">
            <header className="content-header">
                <div>
                    <h1>Advanced Analytics</h1>
                    <p>Deep dive into performance metrics and platform trends.</p>
                </div>
            </header>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Revenue Breakdown by Restaurant</h3>
                    <div style={{ width: "100%", height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={analytics?.revenueByRes} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} />
                                <YAxis dataKey="_id" type="category" axisLine={false} tickLine={false} width={100} />
                                <Tooltip cursor={{fill: '#f8fafc'}} />
                                <Bar dataKey="revenue" fill="#ff6b00" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Payment Method Distribution (by Value)</h3>
                    <div style={{ width: "100%", height: 350 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={analytics?.paymentDist}
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    nameKey="_id"
                                >
                                    {analytics?.paymentDist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card large">
                    <h3>Platform Revenue Growth (Daily)</h3>
                    <div style={{ width: "100%", height: 350 }}>
                        <ResponsiveContainer>
                            <AreaChart data={analytics?.ordersTrends}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="_id" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper import for AreaChart from recharts which was missing in the original replacement but hinted at
import { AreaChart, Area } from "recharts";
