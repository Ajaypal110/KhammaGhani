import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
    MdDashboard, 
    MdShoppingBag, 
    MdRestaurant, 
    MdPeople, 
    MdDirectionsBike, 
    MdRestaurantMenu, 
    MdPayments, 
    MdInsights, 
    MdSettings, 
    MdLogout,
    MdEvent
} from "react-icons/md";
import "../../styles/adminDashboard.css";

const SidebarItem = ({ icon: Icon, label, path, active }) => (
    <Link to={path} className={`sidebar-item ${active ? "active" : ""}`}>
        <Icon className="sidebar-icon" />
        <span>{label}</span>
    </Link>
);

export default function AdminLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const adminName = localStorage.getItem("userName") || "Admin";

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const menuItems = [
        { icon: MdDashboard, label: "Dashboard", path: "/admin/dashboard" },
        { icon: MdShoppingBag, label: "Orders", path: "/admin/orders" },
        { icon: MdRestaurant, label: "Restaurants", path: "/admin/restaurants" },
        { icon: MdDirectionsBike, label: "Delivery Agents", path: "/admin/agents" },
        { icon: MdPeople, label: "Users", path: "/admin/users" },
        { icon: MdRestaurantMenu, label: "Menu Items", path: "/admin/menu" },
        { icon: MdPayments, label: "Payments", path: "/admin/payments" },
        { icon: MdInsights, label: "Analytics", path: "/admin/analytics" },
        { icon: MdEvent, label: "Table Bookings", path: "/admin/bookings" },
        { icon: MdSettings, label: "Settings", path: "/admin/settings" },
    ];

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h1 className="logo-text">Khamma<span>Ghani</span> Admin</h1>
                </div>
                
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <SidebarItem 
                            key={item.path} 
                            {...item} 
                            active={location.pathname === item.path} 
                        />
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <MdLogout className="sidebar-icon" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-search">
                        <input type="text" placeholder="Search orders, restaurants..." />
                    </div>
                    <div className="header-profile">
                        <div className="notification-bell">
                             <div className="bell-badge">3</div>
                             🔔
                        </div>
                        <div className="profile-info">
                            <span className="profile-name">{adminName}</span>
                            <span className="profile-role">Platform Admin</span>
                        </div>
                        <div className="profile-avatar">
                            {adminName[0]}
                        </div>
                    </div>
                </header>

                <section className="admin-content">
                    {children}
                </section>
            </main>
        </div>
    );
}
