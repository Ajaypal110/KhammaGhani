import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { MdArrowBack, MdAttachMoney, MdShoppingBag, MdCheckCircle, MdSearch } from "react-icons/md";

export default function AdminRestaurantDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await API.get(`/admin/restaurants/${id}`);
                setData(res.data);
            } catch (error) {
                console.error("Error fetching restaurant detail:", error);
                navigate("/admin/restaurants");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div className="admin-loading">Loading Franchise Insights...</div>;

    const { restaurant, orders, stats } = data;

    const filteredOrders = orders.filter(o => o._id.includes(searchTerm));

    return (
        <div className="admin-page">
            <header className="content-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate("/admin/restaurants")}>
                        <MdArrowBack />
                    </button>
                    <div>
                        <h1>{restaurant.name}</h1>
                        <p>Detailed performance and financial breakdown for {restaurant.city}.</p>
                    </div>
                </div>
            </header>

            <div className="stats-grid premium-grid">
                <div className="stat-card premium-stat">
                    <div className="stat-info">
                        <h4>Total Franchise Revenue</h4>
                        <div className="stat-value text-success">₹{stats.totalRevenue?.toLocaleString()}</div>
                        <span className="sub-description">Combined Gross Earnings</span>
                    </div>
                </div>
                <div className="stat-card premium-stat">
                    <div className="stat-info">
                        <h4>Digital Settlements</h4>
                        <div className="stat-value text-primary">₹{stats.onlineRevenue?.toLocaleString()}</div>
                        <span className="sub-description">Razorpay / Online Paid</span>
                    </div>
                </div>
                <div className="stat-card premium-stat">
                    <div className="stat-info">
                        <h4>Field Collections</h4>
                        <div className="stat-value text-warning">₹{stats.codRevenue?.toLocaleString()}</div>
                        <span className="sub-description">COD / Cash Delivered</span>
                    </div>
                </div>
                <div className="stat-card premium-stat">
                    <div className="stat-info">
                        <h4>Total Volume</h4>
                        <div className="stat-value">{stats.totalOrders}</div>
                        <span className="sub-description">Processed Orders</span>
                    </div>
                </div>
            </div>

            <div className="admin-table-container mt-8">
                <div className="table-header">
                    <div className="header-title-group">
                        <h3>Franchise Order History</h3>
                        <p className="sub-description">Live transaction log for this branch.</p>
                    </div>
                    <div className="search-box">
                        <MdSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Find by ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Transaction</th>
                            <th>Customer Profile</th>
                            <th>Bill Amount</th>
                            <th>Channel</th>
                            <th>Lifecycle</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order._id}>
                                <td className="font-mono text-xs font-bold">#{order._id.slice(-8).toUpperCase()}</td>
                                <td>
                                    <div className="customer-cell">
                                        <div className="main-title">{order.user?.name}</div>
                                        <div className="sub-description">{order.user?.email}</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="revenue-value">₹{order.totalAmount}</div>
                                </td>
                                <td>
                                    <span className={`split-item ${order.paymentMethod === "Razorpay" ? "online" : "cod"}`}>
                                        {order.paymentMethod === "Razorpay" ? "DIGITAL" : "CASH"}
                                    </span>
                                </td>
                                <td>
                                    <span className="premium-status" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
