import { useState, useEffect } from "react";
import API from "../../api/axios";
import { MdDelete, MdAdd, MdDiscount } from "react-icons/md";

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        discountType: "percentage",
        discountValue: 0,
        minOrderAmount: 0,
        maxDiscount: 0,
        expiryDate: "",
        isActive: true
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const { data } = await API.get("/coupons");
            setCoupons(data);
        } catch (err) {
            console.error("Fetch coupons error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this coupon?")) {
            try {
                await API.delete(`/coupons/${id}`);
                fetchCoupons();
            } catch (err) {
                alert("Failed to delete coupon");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post("/coupons/create", formData);
            setShowForm(false);
            setFormData({
                code: "",
                discountType: "percentage",
                discountValue: 0,
                minOrderAmount: 0,
                maxDiscount: 0,
                expiryDate: "",
                isActive: true
            });
            fetchCoupons();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to create coupon");
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h2 className="admin-page-title">Coupon Management</h2>
                    <p className="admin-page-subtitle">Create and manage discount codes for users</p>
                </div>
                <button className="admin-btn-primary" onClick={() => setShowForm(!showForm)}>
                    <MdAdd /> {showForm ? "Cancel" : "Create Coupon"}
                </button>
            </div>

            {showForm && (
                <div className="admin-card" style={{ marginBottom: "24px" }}>
                    <form onSubmit={handleSubmit} className="admin-form-grid">
                        <div className="form-group">
                            <label>Coupon Code</label>
                            <input 
                                type="text" 
                                required 
                                value={formData.code} 
                                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                placeholder="e.g. SAVE50"
                            />
                        </div>
                        <div className="form-group">
                            <label>Discount Type</label>
                            <select 
                                value={formData.discountType} 
                                onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Discount Value</label>
                            <input 
                                type="number" 
                                required 
                                value={formData.discountValue} 
                                onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Min Order Amount (₹)</label>
                            <input 
                                type="number" 
                                value={formData.minOrderAmount} 
                                onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Max Discount (₹ - for % type)</label>
                            <input 
                                type="number" 
                                value={formData.maxDiscount} 
                                onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Expiry Date</label>
                            <input 
                                type="date" 
                                required 
                                value={formData.expiryDate} 
                                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                            />
                        </div>
                        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                            <button type="submit" className="admin-btn-primary">Save Coupon</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Type</th>
                            <th>Value</th>
                            <th>Min Order</th>
                            <th>Expiry</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{textAlign: "center"}}>Loading...</td></tr>
                        ) : coupons.length === 0 ? (
                            <tr><td colSpan="7" style={{textAlign: "center"}}>No coupons found</td></tr>
                        ) : (
                            coupons.map((coupon) => (
                                <tr key={coupon._id}>
                                    <td><strong style={{color: "#ff6b00"}}>{coupon.code}</strong></td>
                                    <td>{coupon.discountType}</td>
                                    <td>{coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</td>
                                    <td>₹{coupon.minOrderAmount}</td>
                                    <td>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge ${coupon.isActive ? "status-delivered" : "status-cancelled"}`}>
                                            {coupon.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-btn-delete" onClick={() => handleDelete(coupon._id)}>
                                            <MdDelete />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
