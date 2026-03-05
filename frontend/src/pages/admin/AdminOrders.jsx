import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { MdVisibility, MdCancel, MdSearch, MdFilterList } from "react-icons/md";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchOrders = async () => {
        try {
            const res = await API.get("/admin/orders");
            setOrders(res.data);
        } catch (error) {
            console.error("Error fetching admin orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch(status) {
            case "Delivered": return "#10b981";
            case "Cancelled": return "#ef4444";
            case "Placed": return "#3b82f6";
            case "Preparing": return "#f59e0b";
            default: return "#64748b";
        }
    };

    if (loading) return <div className="admin-loading">Loading All Orders...</div>;

    return (
        <div className="admin-page">
            <header className="content-header">
                <div>
                    <h1>Global Orders</h1>
                    <p>Monitor and manage all orders across the platform.</p>
                </div>
                <div className="header-actions">
                    <div className="search-box">
                        <MdSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search Order ID, Customer, Restaurant..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="admin-table-container">
                <div className="table-header">
                    <h3>Recent Orders ({filteredOrders.length})</h3>
                    <div className="table-filters">
                        <button className="filter-btn active">All Orders</button>
                        <button className="filter-btn">Pending</button>
                        <button className="filter-btn">Online Paid</button>
                        <button className="filter-btn">COD</button>
                    </div>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Restaurant</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Delivery Agent</th>
                            <th>Payment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order._id}>
                                <td className="font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</td>
                                <td>{order.user?.name}</td>
                                <td><span className="restaurant-label">{order.restaurant?.name}</span></td>
                                <td className="font-bold">₹{order.totalAmount}</td>
                                <td>
                                    <span className="status-badge" style={{ backgroundColor: `${getStatusColor(order.status)}15`, color: getStatusColor(order.status) }}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>
                                    {order.deliveryAgent?.name ? (
                                        <div className="agent-cell">
                                            <span className="agent-name">{order.deliveryAgent.name}</span>
                                            <span className="agent-tag">{order.deliveryAgent.vehicleType}</span>
                                        </div>
                                    ) : <span className="text-muted italic">Unassigned</span>}
                                </td>
                                <td>
                                    <div className="payment-cell">
                                        <span className={`method-label ${order.paymentMethod === 'Razorpay' ? 'online' : 'cod'}`}>{order.paymentMethod}</span>
                                        <span className={`status-label ${order.paymentStatus === 'Paid' ? 'paid' : 'pending'}`}>{order.paymentStatus}</span>
                                    </div>
                                </td>
                                <td>
                                    <button className="action-btn" title="View Details"><MdVisibility /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
