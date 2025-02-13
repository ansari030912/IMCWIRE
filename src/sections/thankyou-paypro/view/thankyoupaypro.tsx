import { useState, useEffect, useRef } from "react";
import axios, { AxiosResponse } from "axios";
import { BASE_URL, X_API_KEY } from "src/components/Urls/BaseApiUrls";

// Define TypeScript interfaces for the expected API response data
interface OrderData {
  SettlementStatus: string | null;
  PaymentVia: string;
  BillUrl: string;
  DatePaid: string;
  tpayId: number;
  AmountPayable: number;
  OrderNumber: string;
  OrderAmount: number;
  CustomerName: string;
  CustomerBank: string | null;
  OrderStatus: string;
  OrderAmountPaid: number;
}

interface PaymentResponse {
  status: number;
  message: string;
  orderResultData: [
    { Status: string }, // first element
    OrderData         // second element with detailed info
  ];
}

const ThankyouPaypro: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false); // Guard to avoid duplicate API calls

  useEffect(() => {
    // Prevent duplicate API calls (Strict Mode runs effects twice in development)
    if (hasFetched.current) return;
    hasFetched.current = true;

    // Ensure this runs on the client side
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const ordId = searchParams.get("ordId");

      if (!ordId) {
        setError("No order ID provided");
        setLoading(false);
        return;
      }

      const fetchOrderStatus = async () => {
        try {
          const response: AxiosResponse<PaymentResponse> = await axios.post(
            `${BASE_URL}/v1/payment/checkOrderStatus`,
            { ordId },
            {
              headers: {
                "X-API-Key": X_API_KEY,
                "Content-Type": "application/json",
              },
            }
          );

          if (
            response.data &&
            response.data.orderResultData &&
            response.data.orderResultData.length > 1
          ) {
            const status = response.data.orderResultData[1].OrderStatus;
            setOrderStatus(status);
          } else {
            setError("Invalid response from server");
          }
        } catch (err: any) {
          console.error("Error fetching order status:", err);
          setError("Error fetching order status");
        } finally {
          setLoading(false);
        }
      };

      fetchOrderStatus();
    }
  }, []);

  if (loading) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-xl text-red-500">{error}</div>;
  }

  return (
    <section>
      <div className="flex flex-wrap divide-x divide-gray-200">
        <div className="w-full lg:flex-1 px-8">
          <div className="flex flex-col items-center justify-center px-4 text-center h-screen overflow-y-hidden">
            <div className="max-w-xl mx-auto">
              {/* Display icon and message based on payment status */}
              {orderStatus === "PAID" ? (
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
                {orderStatus === "PAID"
                  ? "Thank you for your order!"
                  : "Payment Declined"}
              </h2>
              <p className="mb-5 text-gray-400">
                {orderStatus === "PAID"
                  ? "Payment successful! We appreciate your business and are processing your order now."
                  : "Please check your payment details and try again. Contact support if the issue persists."}
              </p>
              <div className="mb-5">
                <p className="text-lg text-gray-600 mb-6">
                  Checking your order status:
                </p>
                <p
                  className={`text-2xl font-semibold ${
                    orderStatus === "PAID" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {orderStatus}
                </p>
              </div>
              {orderStatus === "PAID" ? (
                <a
                  className="bg-gray-900 rounded-full hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 text-white text-xs font-semibold px-4 h-9 inline-flex items-center transition duration-200"
                  href="/dashboard"
                >
                  Visit Our PR Dashboard
                </a>
              ) : (
                <a
                  className="bg-gray-900 rounded-full hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 text-white text-xs font-semibold px-4 h-9 inline-flex items-center transition duration-200"
                  href="https://imcwire.com/contact/"
                >
                  Contact With Support Team
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThankyouPaypro;
