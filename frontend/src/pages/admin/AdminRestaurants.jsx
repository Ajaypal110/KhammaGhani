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
                            <th>Restaurant</th>
                            <th>Location</th>
                            <th>Orders</th>
                            <th>Revenue</th>
                            <th>Online/COD</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((res) => (
                            <tr key={res._id}>
                                <td>
                                    <div className="cell-main">
                                        <span className="main-title">{res.name}</span>
                                        <span className="sub-title">ID: {res.restaurantId}</span>
                                    </div>
                                </td>
                                <td>{res.city}</td>
                                <td className="font-bold">{res.totalOrders}</td>
                                <td className="font-bold text-success">₹{res.totalRevenue?.toLocaleString()}</td>
                                <td>
                                    <div className="split-cell">
                                        <span className="text-primary">₹{res.onlineRevenue?.toLocaleString()}</span>
                                        <span className="text-warning">₹{res.codRevenue?.toLocaleString()}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="status-badge" style={{ backgroundColor: res.status === "Active" ? "#10b98115" : "#ef444415", color: res.status === "Active" ? "#10b981" : "#ef4444" }}>
                                        {res.status || "Active"}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-group">
                                        <button className="action-btn" title="View Financial Details" onClick={() => navigate(`/admin/restaurants/${res._id}`)}><MdEdit /></button>
                                        <button className="action-btn text-danger" title="Disable Franchise"><MdBlock /></button>
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
