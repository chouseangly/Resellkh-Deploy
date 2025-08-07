// components/sellerDashboard/PaymentRecordCard.jsx
import React from "react";
import {
  CheckCircle,
  Eye,
  Download,
  Truck,
  Users,
  Tag,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  Calendar,
  Receipt,
  DollarSign,
} from "lucide-react";

// Add `onViewReceipt` to the props
const PaymentRecordCard = ({ payment, onViewReceipt }) => {
  // Define the onClick handler function
  const handleViewReceiptClick = () => {
    // Call the parent's handler, passing the payment.id
    if (onViewReceipt) {
      onViewReceipt(payment.id);
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:bg-white/70">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Payment #{payment.paymentId}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {payment.date} at {payment.time}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-medium shadow-lg">
            ✓ {payment.status}
          </span>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm ${
              payment.paymentMethod === "Credit Card"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                : payment.paymentMethod === "PayPal"
                ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                : "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white"
            }`}
          >
            <CreditCard className="w-4 h-4 inline mr-1" />
            {payment.paymentMethod}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Product Card */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200/50">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Product Details</h4>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                src={payment.product.imageUrl}
                alt={payment.product.name}
                className="w-16 h-16 object-cover rounded-xl shadow-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/64x64/cccccc/white?text=No+Image`;
                }}
              />
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {payment.product.qty}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {payment.product.name}
              </p>
              <p className="text-xs text-gray-600 mb-1">
                SKU: {payment.product.sku}
              </p>
              <p className="text-xs font-medium text-green-600">
                ${payment.product.unitPrice.toFixed(2)} each
              </p>
            </div>
          </div>
        </div>

        {/* Buyer Information */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200/50">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Buyer Info</h4>
          </div>
          <div className="space-y-2">
            {/* Assuming this div nesting fix has been applied */}
            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">
                  {payment.buyer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              {payment.buyer.name}
            </div>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {payment.buyer.email}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {payment.buyer.phone}
            </p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200/50">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-purple-600" />
            <h4 className="font-semibold text-gray-900">Shipping</h4>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-900 font-medium">
              {payment.shippingAddress.street}
            </p>
            <p className="text-sm text-gray-600">
              {payment.shippingAddress.city}, {payment.shippingAddress.state}{" "}
              {payment.shippingAddress.postalCode}
            </p>
            <p className="text-sm text-gray-600">
              {payment.shippingAddress.country}
            </p>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200/50">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-green-600" />
            <h4 className="font-semibold text-gray-900">Payment</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900 font-medium">
                ${payment.breakdown.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-gray-900 font-medium">
                ${payment.breakdown.shipping.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax:</span>
              <span className="text-gray-900 font-medium">
                ${payment.breakdown.tax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-bold border-t border-green-200 pt-2 mt-2">
              <span className="text-gray-900">Total:</span>
              <span className="text-green-600 text-lg">
                ${payment.breakdown.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Payment Received
        </button>
        <button
          onClick={handleViewReceiptClick}
          className="px-6 py-3 bg-white/80 text-gray-700 rounded-xl text-sm font-medium hover:bg-white border border-gray-200/50 transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Receipt
        </button>
        {/* Removed commented out buttons for brevity if they are not used */}
      </div>
    </div>
  );
};

export default PaymentRecordCard;
