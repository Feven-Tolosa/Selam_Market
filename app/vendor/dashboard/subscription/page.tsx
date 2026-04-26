"use client";

import React, { useState } from "react";
import { useUser } from "@/useUser";

export default function VendorSubscriptionPage() {
  const [loading, setLoading] = useState(false);
  const { user, loading: userLoading } = useUser();

  const handleSubscribe = async () => {
    if (!user || !user.email) return alert("Login required");
    setLoading(true);
    try {
      const res = await fetch("/api/vendor-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert(data.error || "Failed to start payment");
      }
    } catch (err) {
      alert("Payment error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-2 bg-white rounded shadow mt-10">
      <h1 className="text-2xl font-bold mb-4">Vendor Subscription</h1>
      <p className="mb-6 text-gray-600">
        Choose a subscription plan to unlock premium features and reach more
        customers.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded p-4 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Basic</h2>
          <p className="mb-2">Free</p>
          <ul className="mb-4 text-sm text-gray-500">
            <li>• Limited product listings</li>
            <li>• Basic support</li>
          </ul>
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded cursor-not-allowed"
            disabled
          >
            Current Plan
          </button>
        </div>
        <div className="border-2 border-blue-500 rounded p-4 flex flex-col items-center bg-blue-50">
          <h2 className="text-xl font-semibold mb-2">Premium</h2>
          <p className="mb-2 font-bold text-blue-600">$29/month</p>
          <ul className="mb-4 text-sm text-blue-700">
            <li>• Unlimited product listings</li>
            <li>• Priority support</li>
            <li>• Featured vendor placement</li>
          </ul>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSubscribe}
            disabled={loading || userLoading}
          >
            {loading ? "Redirecting..." : "Subscribe"}
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-400 text-center">
        You can manage or cancel your subscription at any time from your
        dashboard.
      </div>
    </div>
  );
}
