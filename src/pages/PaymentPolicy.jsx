import React from "react";

const PaymentAndMerchantPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-orange-500">
            Kridhana – Payment & Merchant Policy
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            KDASTSHO FINTECH SOLUTIONS
          </p>
        </div>

        {/* Payment Policy */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Kridhana – Payment Policy
          </h2>

          <div className="space-y-3 text-gray-700 leading-relaxed text-justify">
            <p>
              Kridhana displays sportswear, equipment, and related sports
              products listed by independent shopkeepers and sellers. The app
              acts as a digital marketplace connecting users with sellers.
              Product pricing is decided and managed by the respective
              shopkeepers.
            </p>

            <p>
              Payments made for products are collected through the platform for
              order processing. Shopkeepers are responsible for product quality,
              availability, warranty, and product-related disputes. Kridhana
              does not manufacture, store, or directly sell the products shown.
            </p>

            <p>
              Kridhana is responsible only for managing delivery coordination
              and delivery charges. Delivery fees will be clearly shown at
              checkout and may vary based on location or order size. Delivery
              timelines are estimates and may be affected by external factors.
            </p>

            <p>
              All product payments are generally non-refundable unless the
              seller approves returns or replacements as per their policy.
              Delivery charges are non-refundable once the order is shipped.
              Refund timelines depend on the seller and payment provider
              processes.
            </p>

            <p>
              Users must provide accurate payment and delivery information.
              Fraudulent transactions, misuse of payment systems, or chargebacks
              may result in account suspension. Kridhana reserves the right to
              update payment methods, fees, or policies at any time.
            </p>
          </div>
        </section>

        {/* Merchant Policy */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Kridhana – Merchant Policy
          </h2>

          <div className="space-y-3 text-gray-700 leading-relaxed text-justify">
            <p>
              Kridhana allows shopkeepers and sports equipment sellers to list
              their products on the platform for showcase purposes. Product
              listing and display on the app are provided free of cost without
              any upfront charges. Merchants can upload product details, images,
              prices, and stock information.
            </p>

            <p>
              All products listed must be genuine, sports-related, and legally
              permitted for sale. Merchants are fully responsible for product
              quality, accuracy of descriptions, warranties, and customer
              satisfaction. Selling counterfeit, damaged, or misleading products
              is strictly prohibited.
            </p>

            <p>
              When a product is sold through Kridhana, the platform will charge
              a 10% commission on the final product price. This commission is
              deducted from the merchant’s payout for each successful order.
              Kridhana reserves the right to revise commission rates with prior
              notice.
            </p>

            <p>
              Merchants must ensure proper packaging and timely dispatch of
              orders. Delays, wrong items, or poor service may affect merchant
              visibility or lead to account restrictions. Merchants are
              responsible for handling product returns, replacements, or
              warranty claims.
            </p>

            <p>
              Kridhana only facilitates digital listing and delivery
              coordination. The platform is not liable for product defects,
              customer disputes, or legal claims related to items sold.
              Merchants must comply with Indian trade and consumer protection
              laws.
            </p>

            <p>
              Kridhana may suspend or remove merchants involved in fraud,
              counterfeit goods, repeated complaints, or policy violations.
              Platform decisions regarding merchant compliance and enforcement
              are final.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PaymentAndMerchantPolicy;
