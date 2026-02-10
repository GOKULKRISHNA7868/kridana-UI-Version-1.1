import React from "react";

const billOptions = [
  "Utilities",
  "Telecom",
  "DTH",
  "Insurance",
  "Credit",
  "Fast tag",
  "Mutual",
  "Loan",
];

const PaymentsPage = () => (
  <>
    <div className="flex flex-wrap gap-6 mb-10">
      <PaymentCard title="Unpaid Bills" />
      <PaymentCard title="Future Bills" />
    </div>

    <h2 className="text-4xl font-extrabold text-orange-500 mb-8">
      Bill Payments
    </h2>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-16">
      {billOptions.map((label) => (
        <div key={label} className="flex flex-col items-center">
          <div className="w-40 h-40 rounded-full bg-gray-200" />
          <p className="mt-4 text-2xl font-semibold text-orange-500 text-center">
            {label}
          </p>
        </div>
      ))}
    </div>
  </>
);

const PaymentCard = ({ title }) => (
  <div className="bg-orange-500 text-white rounded-xl px-6 py-5 w-full md:w-96 shadow-lg">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-2xl">
        📄
      </div>
      <h3 className="text-3xl font-extrabold">{title}</h3>
    </div>
    <div className="space-y-1 text-sm leading-relaxed">
      <p className="font-semibold">Name</p>
      <p className="font-semibold">Due Amount</p>
      <p className="font-semibold">Due Date</p>
    </div>
  </div>
);

export default PaymentsPage;
