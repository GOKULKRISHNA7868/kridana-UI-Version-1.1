import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl text-orange-500 font-bold text-gray-800">
            Kridhana – Privacy & Platform Policies
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            KDASTSHO FINTECH SOLUTIONS
          </p>
        </div>

        {/* Privacy Policy */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Privacy Policy
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              Kridhana collects necessary details such as name, sport,
              achievements, and contact information.
            </li>
            <li>
              This data is used to provide services, improve features, and show
              relevant sports opportunities.
            </li>
            <li>We do not sell user data to unrelated third parties.</li>
            <li>
              Some profile information may be visible to coaches, academies, or
              sports partners.
            </li>
            <li>Users must ensure the information they provide is accurate.</li>
            <li>We apply reasonable security measures to protect data.</li>
            <li>However, no system can guarantee 100% data security.</li>
            <li>By using Kridhana, you consent to our data practices.</li>
          </ul>
        </section>

        {/* Community & Behavior Policy */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Community & Behavior Policy
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              Kridhana is a professional sports platform requiring respectful
              communication.
            </li>
            <li>
              Harassment, abuse, discrimination, or hate speech is strictly
              prohibited.
            </li>
            <li>
              Political, religious, or offensive discussions are not allowed.
            </li>
            <li>Users must not bully, threaten, or exploit other members.</li>
            <li>
              False achievements or fake certificates are serious violations.
            </li>
            <li>
              Misconduct may lead to warnings, suspension, or permanent bans.
            </li>
            <li>We aim to maintain a safe and positive sports environment.</li>
          </ul>
        </section>

        {/* Content Policy */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Content Policy
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              Users may upload only sports-related and appropriate content.
            </li>
            <li>Content must be original or used with proper permission.</li>
            <li>Copyright infringement and stolen media are prohibited.</li>
            <li>Adult, violent, or unrelated content is not allowed.</li>
            <li>Kridhana may review and remove content violating rules.</li>
            <li>Users remain responsible for the legality of their uploads.</li>
            <li>Content may be used for platform visibility and promotion.</li>
          </ul>
        </section>

        {/* Payment & Refund Policy */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Payment & Refund Policy
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Some features may require subscription fees or payments.</li>
            <li>All payments are processed through secure payment methods.</li>
            <li>Payments made are final and typically non-refundable.</li>
            <li>Users must provide accurate payment details.</li>
            <li>
              Fraudulent transactions or chargebacks may cause account
              suspension.
            </li>
            <li>
              Kridhana may update pricing, plans, or services at any time.
            </li>
            <li>Continued use after price changes means acceptance.</li>
          </ul>
        </section>

        {/* Safety & Risk Policy */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Safety & Risk Policy
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              Kridhana connects users but does not manage physical sports
              events.
            </li>
            <li>
              Participation in trials, training, or matches is at the user’s own
              risk.
            </li>
            <li>
              Kridhana is not responsible for injuries, accidents, or damages.
            </li>
            <li>
              Users should verify event authenticity before participation.
            </li>
            <li>
              We are not liable for disputes between users or third parties.
            </li>
            <li>
              Safety precautions must be followed during sports activities.
            </li>
            <li>
              Parents or guardians are responsible for minors on the platform.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
