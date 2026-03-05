import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { MdPayment, MdCheckCircle, MdPending, MdCancel } from "react-icons/md";

export default function AdminPayments() {
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const [statsRes, ordersRes] = await Promise.all([
                    API.get("/admin/stats"),
                    API.get("/admin/orders")
                ]);
                setStats(statsRes.data);
                setOrders(ordersRes.data.filter(o => o.paymentStatus === "Paid"));
            } catch (error) {
                console.error("Error fetching payments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    if (loading) return <div className="admin-loading">Loading Payment History...</div>;

    return (
        <div className="admin-page">
            <header className="content-header">
                <div>
                    <h1>Payment Monitoring</h1>
                    <p>Track all financial transactions and revenue streams.</p>
                </div>
            </header>

                <div className="stat-card">
                    <div className="stat-info">
                        <h4>Platform Revenue</h4>
                        <div className="stat-value">₹{stats?.totalRevenue.toLocaleString()}</div>
                        <span className="text-muted text-xs">Online + Delivered COD + Bookings</span>
                    </div>
                    <MdPayment style={{ color: '#10b981', fontSize: 32 }} />
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h4>Online Payments</h4>
                        <div className="stat-value">₹{stats?.onlineRevenue.toLocaleString()}</div>
                    </div>
                    <MdCheckCircle style={{ color: '#3b82f6', fontSize: 32 }} />
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h4>COD Collected</h4>
                        <div className="stat-value">₹{stats?.codRevenue.toLocaleString()}</div>
                    </div>
                    <MdCheckCircle style={{ color: '#f59e0b', fontSize: 32 }} />
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h4>Booking Fees</h4>
                        <div className="stat-value">₹{(stats?.bookingRevenue || 0).toLocaleString()}</div>
                    </div>
                    <MdPayment style={{ color: '#8b5cf6', fontSize: 32 }} />
                </div>

            <div className="admin-table-container">
                <div className="table-header">
                    <h3>Recent Transactions</h3>
                    <div className="table-filters">
                        <button className="filter-btn active">All Paid</button>
                        <button className="filter-btn">Online Only</button>
                    </div>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Restaurant</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td className="font-mono text-xs">{order.paymentId || `COD-${order._id.slice(-6)}`}</td>
                                <td className="font-bold">₹{order.totalAmount}</td>
                                <td>
                                    <span className={order.paymentMethod === 'Razorpay' ? 'badge-blue' : 'badge-orange'}>
                                        {order.paymentMethod}
                                    </span>
                                </td>
                                <td>{order.restaurant?.name}</td>
                                <td>{new Date(order.createdAt).toLocaleString()}</td>
                                <td>
                                    <span className="status-badge" style={{ backgroundColor: '#10b98115', color: '#10b981' }}>
                                        Successful
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
