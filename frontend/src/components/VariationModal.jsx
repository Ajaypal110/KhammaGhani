import React, { useState } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import DietaryIcon from './DietaryIcon';

const VariationModal = ({ isOpen, onClose, item, onConfirm }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [instructions, setInstructions] = useState("");
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !item) return null;

  const hasVariations = item.variations && item.variations.length > 0;
  const hasAddOns = item.addOns && item.addOns.length > 0;

  const addOnTotal = selectedAddOns.reduce((acc, curr) => acc + curr.price, 0);
  const unitPrice = (selectedVariant?.price || item.price) + addOnTotal;

  const handleConfirm = () => {
    if (hasVariations && !selectedVariant) {
      alert("Please select an option");
      return;
    }
    onConfirm(item, selectedVariant, quantity, selectedAddOns, "None", instructions);
    onClose();
  };

  const toggleAddOn = (addon) => {
    if (selectedAddOns.find(a => a.name === addon.name)) {
      setSelectedAddOns(selectedAddOns.filter(a => a.name !== addon.name));
    } else {
      setSelectedAddOns([...selectedAddOns, addon]);
    }
  };

  return (
    <div className="variation-modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div className="variation-modal" style={{ background: "#fff", width: "90%", maxWidth: "420px", borderRadius: "24px", overflow: "hidden", position: "relative", animation: "modalSlideUp 0.3s ease" }}>
        
        <button onClick={onClose} style={{ position: "absolute", top: "15px", right: "15px", background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", zIndex: 1, color: "#64748b" }}>
          <FiX size={18} />
        </button>

        <div style={{ position: "relative", height: "180px" }}>
          <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px", background: "linear-gradient(transparent, rgba(0,0,0,0.8))", color: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <DietaryIcon isVeg={item.isVeg} size={14} />
              <h3 style={{ margin: 0, fontSize: "20px" }}>{item.name}</h3>
            </div>
            <p style={{ margin: "5px 0 0 0", fontSize: "14px", opacity: 0.9 }}>{item.category}</p>
          </div>
        </div>

        <div style={{ padding: "24px", maxHeight: "60vh", overflowY: "auto" }}>
          {/* Variations Section */}
          {hasVariations && (
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", color: "#1e293b", fontWeight: "700" }}>Choose Option</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {item.variations.map((v, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedVariant(v)}
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      padding: "14px 16px", 
                      borderRadius: "14px", 
                      border: "1.5px solid",
                      borderColor: selectedVariant?.name === v.name ? "#ff6b00" : "#e2e8f0",
                      background: selectedVariant?.name === v.name ? "#fff7f2" : "#fff",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <span style={{ fontWeight: "600", color: selectedVariant?.name === v.name ? "#ff6b00" : "#1e293b" }}>{v.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontWeight: "700", color: "#1e293b" }}>₹ {v.price}</span>
                      <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid", borderColor: selectedVariant?.name === v.name ? "#ff6b00" : "#cbd5e1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {selectedVariant?.name === v.name && <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff6b00" }}></div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons Section */}
          {hasAddOns && (
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", color: "#1e293b", fontWeight: "700" }}>➕ Add-ons</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {item.addOns.map((addon, i) => {
                  const isSelected = selectedAddOns.find(a => a.name === addon.name);
                  return (
                    <div 
                      key={i} 
                      onClick={() => toggleAddOn(addon)}
                      style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        padding: "12px 16px", 
                        borderRadius: "12px", 
                        border: "1px solid",
                        borderColor: isSelected ? "#ff6b00" : "#e2e8f0",
                        background: isSelected ? "#fff7f2" : "#f8fafc",
                        cursor: "pointer"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "18px", height: "18px", borderRadius: "4px", border: "2px solid", borderColor: isSelected ? "#ff6b00" : "#cbd5e1", background: isSelected ? "#ff6b00" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {isSelected && <FiCheck size={12} color="#fff" />}
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: "500", color: "#334155" }}>{addon.name}</span>
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>+ ₹ {addon.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div style={{ marginBottom: "24px" }}>
             <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", color: "#1e293b", fontWeight: "700" }}>📝 Special Instructions</h4>
             <textarea 
               placeholder="Avoid onions, make it extra spill-proof, etc."
               value={instructions}
               onChange={(e) => setInstructions(e.target.value)}
               style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "14px", minHeight: "60px", fontFamily: "inherit", resize: "none" }}
             />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
            <span style={{ fontWeight: "700", color: "#475569" }}>Quantity</span>
            <div style={{ display: "flex", alignItems: "center", gap: "15px", background: "#f8fafc", padding: "6px 14px", borderRadius: "30px", border: "1px solid #e2e8f0" }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#ff6b00", fontWeight: "bold" }}>−</button>
              <span style={{ fontWeight: "700", fontSize: "16px", minWidth: "20px", textAlign: "center" }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#ff6b00", fontWeight: "bold" }}>+</button>
            </div>
          </div>

          <button 
            onClick={handleConfirm}
            style={{ width: "100%", marginTop: "20px", padding: "16px", borderRadius: "14px", border: "none", background: "#ff6b00", color: "#fff", fontWeight: "700", fontSize: "16px", cursor: "pointer", boxShadow: "0 8px 20px rgba(255,107,0,0.3)" }}
          >
            Add to Cart — ₹ {unitPrice * quantity}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default VariationModal;
