import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { MdSearch, MdCheckCircle, MdCancel, MdEvent } from "react-icons/md";

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await API.get("/admin/bookings");
                setBookings(res.data);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            const res = await API.patch(`/admin/bookings/${id}`, { status });
            setBookings(bookings.map(b => b._id === id ? res.data : b));
        } catch (error) {
            console.error("Error updating booking status:", error);
        }
    };

    const filtered = bookings.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b._id.includes(searchTerm)
    );

    if (loading) return <div className="admin-loading">Loading Reservations...</div>;

    return (
        <div className="admin-page">
            <header className="content-header">
                <div>
                    <h1>Table Bookings</h1>
                    <p>Manage restaurant reservations and seatings across the platform.</p>
                </div>
            </header>

            <div className="admin-table-container">
                <div className="table-header">
                    <h3>All Reservations</h3>
                    <div className="search-box">
                        <MdSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search Customer, Restaurant or ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Restaurant</th>
                            <th>Date & Time</th>
                            <th>Guests</th>
                            <th>Table</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((b) => (
                            <tr key={b._id}>
                                <td className="font-mono text-xs">#{b._id.slice(-6).toUpperCase()}</td>
                                <td>
                                    <div className="cell-main">
                                        <span className="main-title">{b.name}</span>
                                        <span className="sub-title">{b.phone}</span>
                                    </div>
                                </td>
                                <td>{b.restaurant?.name}</td>
                                <td>
                                    <div className="cell-main">
                                        <span className="main-title">{b.date}</span>
                                        <span className="sub-title">{b.timeFrom} - {b.timeTo}</span>
                                    </div>
                                </td>
                                <td>{b.guests}</td>
                                <td>#{b.tableNo}</td>
                                <td>
                                    <span className="status-badge" style={{ 
                                        backgroundColor: b.status === "Confirmed" ? "#10b98115" : b.status === "Cancelled" ? "#ef444415" : "#f59e0b15",
                                        color: b.status === "Confirmed" ? "#10b981" : b.status === "Cancelled" ? "#ef4444" : "#f59e0b"
                                    }}>
                                        {b.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-group">
                                        {b.status === "Pending" && (
                                            <>
                                                <button 
                                                    className="action-btn text-success" 
                                                    title="Confirm Booking"
                                                    onClick={() => handleUpdateStatus(b._id, "Confirmed")}
                                                >
                                                    <MdCheckCircle />
                                                </button>
                                                <button 
                                                    className="action-btn text-danger" 
                                                    title="Cancel Booking"
                                                    onClick={() => handleUpdateStatus(b._id, "Cancelled")}
                                                >
                                                    <MdCancel />
                                                </button>
                                            </>
                                        )}
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
