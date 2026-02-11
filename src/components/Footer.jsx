import React, { useEffect, useState } from "react";
import { FaLinkedinIn, FaArrowUp } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = ({ darkMode }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer
      className={`w-full pt-10 pb-6 px-6 lg:px-20 relative overflow-hidden transition-all duration-700
      ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      ${
        darkMode
          ? "bg-gradient-to-r from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] text-gray-300"
          : "bg-gradient-to-r from-[#FFE2B8] via-[#FFF1DB] to-[#FFD199] text-[#5D3A09]"
      }`}
    >
      {/* BACKGROUND GLOWS */}
      <div
        className={`absolute -top-24 -left-24 w-80 h-80 rounded-full blur-[140px]
        ${darkMode ? "bg-[#DB6A2E]/10" : "bg-[#DB6A2E]/25"}`}
      />
      <div
        className={`absolute bottom-0 right-0 w-80 h-80 rounded-full blur-[140px]
        ${darkMode ? "bg-black/40" : "bg-black/10"}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-14 relative z-10">
        {/* LOGO + INTRO */}
        <div className="flex flex-col items-start gap-5 md:col-span-2">
          <Link to="/" onClick={scrollToTop}>
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl
              hover:scale-105 transition-all duration-500 cursor-pointer
              ${darkMode ? "bg-white" : "bg-white"}`}
            >
              <div
                className="inline-flex items-center justify-center
  w-[32rem] aspect-square
  rounded-full bg-white overflow-hidden shadow-2xl"
              >
                <img
                  src="/Kridana logo.png"
                  alt="Kridana Logo"
                  className="w-full h-full object-contain scale-[1.4]"
                />
              </div>
            </div>
          </Link>

          <h2
            className={`text-2xl font-bold tracking-wide ${
              darkMode ? "text-white" : "text-[#3b2406]"
            }`}
          >
            KRIDANA
          </h2>

          <p
            className={`text-base leading-relaxed text-justify ${
              darkMode ? "text-gray-400" : "text-[#5D3A09]/80"
            }`}
          >
            Kridana is a SaaS platform designed to solve everyday business
            challenges across B2B, B2C, and C2C ecosystems by streamlining
            operations and enabling scalable growth. Built specifically for the
            sports ecosystem, it empowers institutions, academies, and
            independent trainers with tools to manage attendance, performance,
            reporting, and business workflows. By digitizing operations, Kridana
            helps sports professionals grow efficiently, improve engagement, and
            focus on delivering better training outcomes.
          </p>

          {/* SOCIAL */}
          <div className="flex gap-3 mt-2">
            <a
              href="https://www.linkedin.com/company/kridana-sports-software/"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 flex justify-center items-center rounded-full border
    ${
      darkMode
        ? "border-[#DB6A2E] text-[#DB6A2E] hover:bg-[#DB6A2E] hover:text-black"
        : "border-[#DB6A2E] text-[#DB6A2E] hover:bg-[#DB6A2E] hover:text-white"
    }
    transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
            >
              <FaLinkedinIn size={18} />
            </a>
          </div>
        </div>

        {/* COMPANY */}
        <div className="flex flex-col gap-3 md:pl-6">
          <h3 className="text-xl font-semibold mb-2 text-[#DB6A2E]">Company</h3>
          {[
            { label: "About Us", link: "/about" },
            { label: "Contact Us", link: "/contact" },
            { label: "Career", link: "/career" },
            { label: "Terms & Conditions", link: "/terms" },
            { label: "Privacy Policy", link: "/privacy" },
            { label: "Payment Policy", link: "/paymentpolicy" },
            {
              label: "Delivery & Shipping Policy",
              link: "/delivery-shipping-policy",
            },
            { label: "Customer-Centric Policies", link: "/customer-policies" },
            {
              label: "Payment & Refund Policy",
              link: "/payment-refund-policy",
            },
          ].map((item, i) => (
            <Link
              onClick={scrollToTop}
              key={i}
              to={item.link}
              className={`text-base group transition-all
              ${darkMode ? "hover:text-white" : "hover:text-[#DB6A2E]"}`}
            >
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:underline">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* SERVICES */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold mb-2 text-[#DB6A2E]">
            Categories
          </h3>
          {[
            { label: "Wellness", link: "/services/wellness" },
            { label: "Martial Arts", link: "/services/martial-arts" },
            {
              label: "Adventure Outdoor Sports",
              link: "/services/adventure-outdoor-sports",
            },
            { label: "Team Ball Sports", link: "/services/team-ball-sports" },
            { label: "Racket Sports", link: "/services/racket-sports" },
            { label: "Fitness", link: "/services/fitness" },
            {
              label: "Target Precision Sports",
              link: "/services/target-precision-sports",
            },
            {
              label: "Equestrian Sports",
              link: "/services/equestrian-sports",
            },
            { label: "Ice Sports", link: "/services/ice-sports" },
            { label: "Wellness", link: "/services/wellness" },
            { label: "Dance", link: "/services/dance" },
          ].map((item, i) => (
            <Link
              onClick={scrollToTop}
              key={i}
              to={item.link}
              className={`text-base group transition-all
              ${darkMode ? "hover:text-white" : "hover:text-[#DB6A2E]"}`}
            >
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:underline">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* ADDRESS */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold mb-2 text-[#DB6A2E]">Address</h3>
          <div>
            <p className="font-semibold">Head Office</p>
            <p
              className={`text-base leading-relaxed ${
                darkMode ? "text-gray-400" : "text-[#5D3A09]/80"
              }`}
            >
              KDASTSHO Fintech Solutions Pvt Ltd <br />
              Opp SAIBABA Temple, Ramapuram, Nandyal District, AP 518122 <br />
              <a
                href="mailto:info@kdasthofintechsolutions.com"
                className="underline hover:text-[#DB6A2E] transition-all"
              >
                info@kdasthofintechsolutions.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div
        className={`text-center text-lg mt-12 font-medium relative z-10 ${
          darkMode ? "text-gray-400" : "text-[#5D3A09]"
        }`}
      >
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold bg-gradient-to-r from-[#F69B2E] to-[#DB6A2E] bg-clip-text text-transparent">
          Kridana. All rights reserved. Kridana is a product of Kdastsho Fintech
          Solutions Pvt. Ltd., India
        </span>
      </div>

      {/* SCROLL TOP */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 w-12 h-12 rounded-full
        bg-gradient-to-br from-[#F69B2E] to-[#DB6A2E] text-white
        flex justify-center items-center shadow-xl
        hover:scale-110 hover:shadow-[0_0_25px_#DB6A2E]
        transition-all duration-300`}
      >
        <FaArrowUp size={20} />
      </button>
    </footer>
  );
};

export default Footer;
