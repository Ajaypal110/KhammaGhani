import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { MdSearch, MdDirectionsBike, MdFiberManualRecord } from "react-icons/md";

export default function AdminAgents() {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchAgents = async () => {
        try {
            const res = await API.get("/admin/agents");
            setAgents(res.data);
        } catch (error) {
            console.error("Error fetching agents:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const filtered = agents.filter(agent => 
        agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.agentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch(status) {
            case "Available": return "#10b981";
            case "Busy": return "#f59e0b";
            case "Offline": return "#64748b";
            default: return "#64748b";
        }
    };

    if (loading) return <div className="admin-loading">Loading Delivery Force...</div>;

    return (
        <div className="admin-page">
            <header className="content-header">
                <div>
                    <h1>Delivery Management</h1>
                    <p>Track and manage your platform's delivery fleet.</p>
                </div>
                <div className="header-actions">
                    <div className="search-box">
                        <MdSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search Agent ID or Name..." 
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
                            <th>Agent</th>
                            <th>Vehicle</th>
                            <th>Restaurant Partner</th>
                            <th>Status</th>
                            <th>Active Order</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((agent) => (
                            <tr key={agent._id}>
                                <td>
                                    <div className="cell-agent">
                                        <div className="agent-avatar"><MdDirectionsBike /></div>
                                        <div className="agent-info">
                                            <span className="agent-name">{agent.name}</span>
                                            <span className="agent-id">ID: {agent.agentId}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="vehicle-info">
                                        <span className="v-type">{agent.vehicleType}</span>
                                        <span className="v-num">{agent.vehicleNumber}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="partner-label">{agent.restaurant?.name || "Independent"}</span>
                                </td>
                                <td>
                                    <div className="status-indicator">
                                        <MdFiberManualRecord style={{ color: getStatusColor(agent.status) }} />
                                        <span>{agent.status}</span>
                                    </div>
                                </td>
                                <td>{agent.currentOrderId ? <span className="text-primary font-bold">In Delivery</span> : <span className="text-muted">Idle</span>}</td>
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
