import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { MdSearch, MdMail, MdPhone, MdShield } from "react-icons/md";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = async () => {
        try {
            const res = await API.get("/admin/users");
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching admin users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filtered = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="admin-loading">Loading Platform Users...</div>;

    return (
        <div className="admin-page">
            <header className="content-header">
                <div>
                    <h1>User Database</h1>
                    <p>Manage customers and platform members.</p>
                </div>
                <div className="header-actions">
                    <div className="search-box">
                        <MdSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search by name, email, phone..." 
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
                            <th>User Profile</th>
                            <th>Contact Info</th>
                            <th>Role</th>
                            <th>Joined On</th>
                            <th>Verfied</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((user) => (
                            <tr key={user._id}>
                                <td>
                                    <div className="cell-profile">
                                        <div className="avatar-small">{user.name[0]}</div>
                                        <span className="name">{user.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-info">
                                        <span><MdMail /> {user.email}</span>
                                        <span><MdPhone /> {user.phone || "No Phone"}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="role-chip">{user.role.toUpperCase()}</span>
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <span className={user.isEmailVerified ? "text-success" : "text-muted"}>
                                        {user.isEmailVerified ? "Yes" : "No"}
                                    </span>
                                </td>
                                <td>
                                    <button className="action-btn text-danger" title="Restrict User"><MdShield /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
