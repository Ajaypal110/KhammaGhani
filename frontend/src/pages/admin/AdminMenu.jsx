import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { MdSearch, MdFastfood } from "react-icons/md";

export default function AdminMenu() {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await API.get("/admin/menu");
                setMenu(res.data);
            } catch (error) {
                console.error("Error fetching admin menu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    const filtered = menu.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="admin-loading">Loading Global Menu...</div>;

    return (
        <div className="admin-page">
            <header className="content-header">
                <div>
                    <h1>Global Menu Items</h1>
                    <p>Browse and manage dishes from all restaurant partners.</p>
                </div>
                <div className="header-actions">
                    <div className="search-box">
                        <MdSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search dishes or restaurants..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Dish Image</th>
                            <th>Dish Name</th>
                            <th>Restaurant</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((item) => (
                            <tr key={item._id}>
                                <td>
                                    <img src={item.image} alt={item.name} style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }} />
                                </td>
                                <td>
                                    <div className="cell-main">
                                        <span className="main-title">{item.name}</span>
                                        <span className="sub-title">{item.description?.slice(0, 30)}...</span>
                                    </div>
                                </td>
                                <td><span className="partner-label">{item.restaurant?.name}</span></td>
                                <td><span className="category-chip">{item.category}</span></td>
                                <td className="font-bold">₹{item.price}</td>
                                <td>
                                    <button className="action-btn">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
