import React from "react";
import { useSearchParams, Link } from "react-router-dom";

const ThankyouStripe = () => {
  // Retrieve query parameters using useSearchParams
  const [searchParams] = useSearchParams();
  console.log(searchParams);
  // Use the correct parameter name that matches the URL ("isvalid")
  const isValid = searchParams.get("isvalid");
  console.log(isValid);

  return (
    <section>
      <div className="flex flex-wrap divide-x divide-gray-200">
        <div className="w-full lg:flex-1 px-8">
          <br />
          <br />
          <br />
          <br />
          <div className="flex flex-col items-center justify-center px-4 text-center overflow-y-hidden">
            <div className="max-w-xl mx-auto">
              {/* Update Icon and Message Based on Payment Status */}
              {isValid === "true" ? (
                <>
                  <div className="mb-12 text-7xl">🎉</div>
                  <span className="mb-5 inline-block text-gray-400">
                    You have successfully ordered all items.
                  </span>
                </>
              ) : (
                <>
                  <div className="mb-12 text-7xl">🚫</div>
                  <span className="mb-5 inline-block text-gray-400">
                    Your payment was unsuccessful.
                  </span>
                </>
              )}
              <h2 className="mb-5 font-black text-4xl">
                {isValid === "true"
                  ? "Thank you for your order!"
                  : "Payment Declined"}
              </h2>
              <p className="mb-5 text-gray-400">
                {isValid === "true"
                  ? "Payment successful! We appreciate your business and are processing your order now."
                  : "Please check your payment details and try again. Contact support if the issue persists."}
              </p>
              <div className="mb-5">
                <p className="text-lg text-gray-600 mb-6">
                  Checking your order status:
                </p>
                <p
                  className={`text-2xl font-semibold ${
                    isValid === "true" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {isValid === "true" ? "PAID" : "UNPAID"}
                </p>
              </div>
              {isValid === "true" ? (
                <Link
                  to="/dashboard"
                  className="bg-gray-900 rounded-full hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 text-white text-xs font-semibold px-4 h-9 inline-flex items-center transition duration-200"
                >
                  Visit Our PR Dashboard
                </Link>
              ) : (
                <Link
                  to="https://imcwire.com/contact/"
                  className="bg-gray-900 rounded-full hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 text-white text-xs font-semibold px-4 h-9 inline-flex items-center transition duration-200"
                >
                  Contact With Support Team
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThankyouStripe;
