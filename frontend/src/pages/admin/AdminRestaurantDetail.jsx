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

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <h4>Total Revenue</h4>
                        <div className="stat-value">₹{stats.totalRevenue?.toLocaleString()}</div>
                    </div>
                    <MdAttachMoney style={{ color: '#10b981', fontSize: 32 }} />
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h4>Online Earnings</h4>
                        <div className="stat-value">₹{stats.onlineRevenue?.toLocaleString()}</div>
                    </div>
                    <MdCheckCircle style={{ color: '#3b82f6', fontSize: 32 }} />
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h4>COD Earnings</h4>
                        <div className="stat-value">₹{stats.codRevenue?.toLocaleString()}</div>
                    </div>
                    <MdShoppingBag style={{ color: '#f59e0b', fontSize: 32 }} />
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h4>Total Orders</h4>
                        <div className="stat-value">{stats.totalOrders}</div>
                    </div>
                    <MdShoppingBag style={{ color: '#ff6b00', fontSize: 32 }} />
                </div>
            </div>

            <div className="admin-table-container mt-8">
                <div className="table-header">
                    <h3>Orders Breakdown</h3>
                    <div className="search-box">
                        <MdSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search Order ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order._id}>
                                <td className="font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</td>
                                <td>{order.user?.name}</td>
                                <td className="font-bold">₹{order.totalAmount}</td>
                                <td>{order.paymentMethod}</td>
                                <td>
                                    <span className="status-badge" style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
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
