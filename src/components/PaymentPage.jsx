// src/components/PaymentPage.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { doc, runTransaction } from "firebase/firestore";

const formatAddress = (addr) => {
  if (!addr) return "";
  return `${addr.fullName}
${addr.address}
${addr.city}, ${addr.state} ${addr.zip}
Phone: ${addr.phone || ""}`;
};

const PaymentPage = () => {
  const [method, setMethod] = useState("none");
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, total } = useCart();
  const grandTotal = total;

  // Get address from AddressPage
  const addressFromAddressPage = formatAddress(location.state?.order?.address);

  // Address state
  const [addressText, setAddressText] = useState(addressFromAddressPage || "");
  const [extraAddresses, setExtraAddresses] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [draftAddress, setDraftAddress] = useState(addressText);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const isCredit = method === "credit";

  const handleBackToAddress = () => {
    navigate("/AddressPage");
  };

  const handlePlaceOrder = async () => {
    if (method === "none") {
      alert("Please select a payment method.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Please login to continue");
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        // 🔹 Prepare items + reduce stock
        const orderItems = [];

        for (const item of cartItems) {
          const productRef = doc(db, "products", item.id);
          const productSnap = await transaction.get(productRef);

          if (!productSnap.exists()) {
            throw new Error("Product not found");
          }

          const productData = productSnap.data();

          if (productData.stockAvailable < item.qty) {
            throw new Error(`Insufficient stock for ${item.name}`);
          }

          // 🔻 Reduce stock
          transaction.update(productRef, {
            stockAvailable: productData.stockAvailable - item.qty,
          });

          orderItems.push({
            productId: item.id,
            productName: item.name,
            productPrice: item.price,
            quantity: item.qty,
            selectedSize: item.selectedSize || null,
            productImage: item.image || item.imageUrl || "",
            instituteUID: productData.instituteUID || null,
          });
        }

        // 🧾 Save order
        const orderRef = doc(collection(db, "orders"));
        transaction.set(orderRef, {
          userUID: user.uid,
          userEmail: user.email,

          items: orderItems,

          subTotal: total,
          grandTotal: grandTotal,

          deliveryAddress: getSelectedAddress(),

          paymentMethod: method,
          paymentStatus: method === "credit" ? "paid" : "pending",

          // 🔽 ORDER TRACKING (ADMIN FILLS LATER)
          orderStatus: "placed", // user-visible
          deliveryStatus: "", // admin updates later
          deliveryPartner: "", // optional future use
          trackingNumber: "", // optional future use
          expectedDeliveryDate: null, // optional future use

          createdAt: serverTimestamp(),
        });
      });

      alert("Order placed successfully!");
      navigate("/orders"); // ✅ SHOW ORDERS AFTER PLACE
    } catch (error) {
      console.error("Order failed:", error);
      alert(error.message || "Failed to place order");
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await transaction.get(orderRef);

        if (!orderSnap.exists()) {
          throw new Error("Order not found");
        }

        const orderData = orderSnap.data();

        if (orderData.orderStatus === "cancelled") {
          throw new Error("Order already cancelled");
        }

        // 🔁 Restore stock for each product
        for (const item of orderData.items) {
          const productRef = doc(db, "products", item.productId);
          const productSnap = await transaction.get(productRef);

          if (!productSnap.exists()) continue;

          const productData = productSnap.data();

          transaction.update(productRef, {
            stockAvailable: (productData.stockAvailable || 0) + item.quantity,
          });
        }

        // ❌ Update order status
        transaction.update(orderRef, {
          orderStatus: "cancelled",
          cancelledAt: serverTimestamp(),
        });
      });

      alert("Order cancelled & stock restored successfully");
    } catch (error) {
      console.error("Cancel failed:", error);
      alert(error.message || "Failed to cancel order");
    }
  };

  // Address handlers
  const handleEditClick = () => {
    if (selectedIndex === 0) {
      setDraftAddress(addressText);
    } else {
      setDraftAddress(extraAddresses[selectedIndex - 1] || "");
    }
    setIsAddingNew(false);
    setIsEditingAddress(true);
  };

  const handleAddNewAddress = () => {
    const newIndex = extraAddresses.length + 1;
    setDraftAddress("");
    setIsAddingNew(true);
    setIsEditingAddress(true);
    setSelectedIndex(newIndex);
  };

  const handleSaveClick = () => {
    const trimmedAddress = draftAddress.trim();
    if (!trimmedAddress) {
      setIsEditingAddress(false);
      setIsAddingNew(false);
      return;
    }
    if (isAddingNew) {
      const updated = [...extraAddresses, trimmedAddress];
      setExtraAddresses(updated);
      setSelectedIndex(updated.length);
    } else {
      if (selectedIndex === 0) {
        setAddressText(trimmedAddress);
      } else {
        const updated = [...extraAddresses];
        updated[selectedIndex - 1] = trimmedAddress;
        setExtraAddresses(updated);
      }
    }
    setIsEditingAddress(false);
    setIsAddingNew(false);
  };

  const handleCancelClick = () => {
    setIsEditingAddress(false);
    setIsAddingNew(false);
  };

  const handleDeleteAddress = () => {
    if (selectedIndex === 0) {
      alert("Shipping address cannot be deleted.");
      return;
    }
    const idx = selectedIndex - 1;
    const updated = extraAddresses.filter((_, i) => i !== idx);
    setExtraAddresses(updated);
    if (updated.length === 0) {
      setSelectedIndex(0);
    } else if (selectedIndex > updated.length) {
      setSelectedIndex(updated.length);
    }
  };

  const getSelectedAddress = () => {
    if (selectedIndex === 0) return addressText;
    return extraAddresses[selectedIndex - 1] || "";
  };

  const currentAddressLabel =
    selectedIndex === 0 ? "Shipping Address" : `Address ${selectedIndex}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-7xl bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Payment</h1>
          <span className="text-xs text-gray-500">
            Step 2 of 2 · Payment & Order Summary
          </span>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Payment + Address Section */}
            <section className="flex-[0.6] text-[13px] border border-gray-200 rounded-lg p-4">
              <p className="font-semibold mb-2 flex items-center justify-between">
                <span>{currentAddressLabel}</span>
                <span className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddNewAddress}
                    className="text-[11px] text-orange-500 hover:text-orange-600 underline"
                  >
                    + New Address
                  </button>
                  {!isEditingAddress && (
                    <button
                      type="button"
                      onClick={handleEditClick}
                      className="flex items-center gap-1 text-[11px] text-orange-500 hover:text-orange-600"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 4h2m-1-1v2m5.657 1.343l-1.414-1.414a2 2 0 00-2.828 0L5 12v3h3l8.414-8.414a2 2 0 000-2.828z"
                        />
                      </svg>
                      Edit
                    </button>
                  )}
                  {!isEditingAddress && selectedIndex !== 0 && (
                    <button
                      type="button"
                      onClick={handleDeleteAddress}
                      className="text-[11px] text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                  )}
                </span>
              </p>

              <div className="flex flex-wrap gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setSelectedIndex(0)}
                  className={
                    "px-2 py-1 text-[11px] rounded-full border " +
                    (selectedIndex === 0
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-300 text-gray-700")
                  }
                >
                  Shipping Address
                </button>
                {extraAddresses.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedIndex(idx + 1)}
                    className={
                      "px-2 py-1 text-[11px] rounded-full border " +
                      (selectedIndex === idx + 1
                        ? "border-orange-500 bg-orange-50 text-orange-600"
                        : "border-gray-300 text-gray-700")
                    }
                  >
                    Address {idx + 1}
                  </button>
                ))}
              </div>

              {!isEditingAddress ? (
                <div className="border border-gray-300 rounded bg-white mb-4">
                  <div className="min-h-[80px] px-4 py-3 flex flex-col justify-center">
                    {(getSelectedAddress() || "")
                      .split("\n")
                      .map((line, idx) => (
                        <p
                          key={idx}
                          className="text-[12px] text-gray-800 leading-tight"
                        >
                          {line}
                        </p>
                      ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="border border-orange-500 rounded bg-white mb-2">
                    <textarea
                      autoFocus
                      value={draftAddress}
                      onChange={(e) => setDraftAddress(e.target.value)}
                      rows={3}
                      className="w-full min-h-[80px] border-none rounded px-4 py-3 text-[12px] leading-tight resize-none focus:outline-none"
                      placeholder={
                        isAddingNew
                          ? "Enter new shipping address..."
                          : "Edit shipping address..."
                      }
                    />
                  </div>
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={handleSaveClick}
                      className="flex-1 h-8 bg-orange-500 text-white text-[12px] font-semibold rounded hover:bg-orange-600 transition"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelClick}
                      className="flex-1 h-8 border border-gray-300 text-[12px] font-semibold rounded text-gray-700 hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              <p className="font-semibold mb-2">Payment Options</p>

              <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                {[
                  { key: "credit", label: "Credit / Debit Card" },
                  { key: "apple", label: "Pay" },
                  { key: "gpay", label: "GPay" },
                  { key: "phonepe", label: "PhonePe" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMethod(key)}
                    className={
                      "border rounded px-3 py-2 flex items-center gap-2 " +
                      (method === key
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-300")
                    }
                  >
                    <span
                      className={
                        "w-3 h-3 rounded-full border " +
                        (method === key
                          ? "border-orange-500 bg-orange-500"
                          : "border-gray-400")
                      }
                    />
                    {label}
                  </button>
                ))}
              </div>

              {isCredit && (
                <div className="mb-4 border-t border-gray-200 pt-3">
                  <p className="text-orange-500 font-semibold mb-2">
                    Credit / Debit Card Details
                  </p>
                  <div className="mb-3">
                    <input
                      placeholder="Card Number"
                      className="w-full h-9 border border-gray-300 rounded px-3 text-xs"
                    />
                  </div>
                  <div className="flex gap-3">
                    <input
                      placeholder="MM/YY"
                      className="flex-1 h-9 border border-gray-300 rounded px-3 text-xs"
                    />
                    <input
                      placeholder="CVV"
                      className="flex-1 h-9 border border-gray-300 rounded px-3 text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 mt-6">
                <button
                  onClick={handleBackToAddress}
                  className="w-40 h-9 border border-gray-300 text-xs font-semibold rounded text-gray-700 hover:bg-gray-100 transition"
                >
                  ← Back to Address
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="flex-1 h-9 bg-orange-500 text-white text-xs font-semibold rounded hover:bg-orange-600 transition"
                >
                  Place Order
                </button>
              </div>
            </section>

            {/* Order Summary - SAME AS ADDRESS PAGE + YOUR SCREENSHOTS */}
            <aside className="flex-[0.4] text-[12px] border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-orange-500 font-semibold mb-2.5">
                Order Summary
              </h3>

              {cartItems.length === 0 ? (
                <p className="text-xs text-gray-500 mb-3">
                  Your cart is empty. Add items from the shop to see them here.
                </p>
              ) : (
                <div className="space-y-3 mb-3 max-h-56 overflow-y-auto pr-1">
                  {cartItems.map((item, index) => {
                    const imageSrc =
                      item.image || item.imageUrl || "/placeholder.jpg";
                    return (
                      <div
                        className="flex items-center gap-3"
                        key={`${item.id}-${index}`}
                      >
                        {/* IMAGE */}
                        <div className="w-10 h-10 bg-gray-200 overflow-hidden rounded">
                          <img
                            src={imageSrc}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 leading-tight min-w-0">
                          <p className="text-[11px] font-semibold truncate">
                            {item.name}
                          </p>
                          {/* ✅ SIZE - SAME AS ADDRESS PAGE */}
                          {item.selectedSize && (
                            <p className="text-[11px] text-gray-500">
                              Size: {item.selectedSize}
                            </p>
                          )}
                          <p className="text-[11px] text-gray-500">
                            Qty {item.qty} · ₹{" "}
                            {item.price.toLocaleString("en-IN")}
                          </p>
                        </div>

                        <span className="text-[11px] font-semibold">
                          ₹ {(item.price * item.qty).toLocaleString("en-IN")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="border-t border-gray-200 pt-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <span>Sub Total</span>
                  <span>₹ {total.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <input
                      className="h-7 w-24 border border-gray-300 px-2 text-[11px]"
                      placeholder="Coupon"
                    />
                    <button className="h-7 px-3 bg-orange-400 text-white text-[11px] rounded">
                      Apply
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[12px]">
                  <span>Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-2 mt-1">
                  <span className="font-semibold text-[12px]">Grand Total</span>
                  <span className="font-semibold text-[12px]">
                    ₹ {grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
