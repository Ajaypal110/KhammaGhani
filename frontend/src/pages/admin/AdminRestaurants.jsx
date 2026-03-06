import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { MdEdit, MdBlock, MdSearch, MdAdd } from "react-icons/md";

export default function AdminRestaurants() {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchRestaurants = async () => {
        try {
            const res = await API.get("/admin/restaurants");
            setRestaurants(res.data);
        } catch (error) {
            console.error("Error fetching restaurants:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const filtered = restaurants.filter(res => 
        res.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="admin-loading">Loading Restaurants...</div>;

    return (
        <div className="admin-page">
            <header className="content-header">
                <div>
                    <h1>Restaurant Management</h1>
                    <p>Onboard and manage restaurant franchises.</p>
                </div>
                <div className="header-actions">
                    <div className="search-box">
                        <MdSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search by name, city..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="primary-btn"><MdAdd /> Add Restaurant</button>
                </div>
            </header>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Restaurant Profile</th>
                            <th>Location</th>
                            <th>Performance</th>
                            <th>Revenue (Total)</th>
                            <th>Payment Channels</th>
                            <th>Franchise Status</th>
                            <th>Control</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((res) => (
                            <tr key={res._id}>
                                <td>
                                    <div className="restaurant-cell">
                                        <div className="res-avatar">
                                            {res.name?.[0].toUpperCase()}
                                        </div>
                                        <div className="cell-main">
                                            <span className="main-title">{res.name}</span>
                                            <span className="sub-description">Franchise ID: {res.restaurantId}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="location-cell">
                                        <div className="city-name">{res.city}</div>
                                        <div className="sub-description">{res.phone}</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="stats-mini-cell">
                                        <span className="count-badge">{res.totalOrders}</span>
                                        <span className="sub-description">Lifetime Orders</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="revenue-main-cell">
                                        <span className="revenue-value">₹{res.totalRevenue?.toLocaleString()}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="revenue-split-visual">
                                        <div className="split-item online">
                                            <span className="split-label">ONLINE</span>
                                            <span className="split-amount">₹{res.onlineRevenue?.toLocaleString()}</span>
                                        </div>
                                        <div className="split-item cod">
                                            <span className="split-label">COD</span>
                                            <span className="split-amount">₹{res.codRevenue?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`premium-status ${res.status === "Active" ? "active" : "disabled"}`}>
                                        <div className="status-indicator"></div>
                                        {res.status || "Active"}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-row">
                                        <button className="icon-btn-outline" title="Analytics & Settings" onClick={() => navigate(`/admin/restaurants/${res._id}`)}><MdEdit /></button>
                                        <button className="icon-btn-outline danger" title="Deactivate Franchise"><MdBlock /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
