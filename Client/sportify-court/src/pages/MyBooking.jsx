import { useEffect, useState } from "react";
import { api } from "../helpers/http-client";
import { ErrorAlert, SuccessAlert } from "../helpers/alert";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      import.meta.env.VITE_MIDTRANS_CLIENT_KEY
    );
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  useEffect(() => {
    async function fetchBookings() {
      try {
        setLoading(true);
        const res = await api.get("/bookings/mine");
        setBookings(res.data);
        SuccessAlert("Bookings fetched successfully!");
      } catch (err) {
        console.error("Gagal ambil data bookings:", err);
        const errors =
          err.response?.data?.message || err.message || "Something went wrong!";
        ErrorAlert(errors, "Fetch Booking Failed");
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const handlePayment = async (bookingId) => {
    // Trigger snap popup. @TODO: Replace TRANSACTION_TOKEN_HERE with your transaction token
    try {
      // const bookingRes = await api.get("/bookings/mine");
      // const bookingId = bookingRes.data?.[0]?.id;

      if (!bookingId) {
        ErrorAlert("No booking found to pay for.");
        return;
      }
      // console.log(localStorage.getItem("access_token"));
      // console.log("TOKEN DARI LOCAL:", localStorage.getItem("access_token"));
      const { data } = await api.post("/payments/midtrans/initiate", {
        BookingId: bookingId,
      });
      console.log("Initiate Response:", data);
      console.log("Snap:", window.snap);
      if (window.snap && typeof window.snap.pay === "function") {
        window.snap.pay(data.transactionToken, {
          onSuccess: async function () {
            /* You may add your own implementation here */
            // console.log("Payment Success:", result);
            // await api.patch("/payments/me/upgrade", {
            //   orderId: data.orderId,
            // });

            window.snap.pay(data.transactionToken, {
              onSuccess: async () => {
                SuccessAlert("Payment successful!");

                setTimeout(async () => {
                  try {
                    const res = await api.get("/bookings/mine");
                    setBookings(res.data);
                  } catch (err) {
                    console.error("Failed to refresh bookings:", err);
                  }
                }, 2000);
              },

              onPending: (result) => {
                console.log("Pending:", result);
                ErrorAlert("Waiting for payment confirmation.");
              },

              onError: (error) => {
                console.error("Payment Error:", error);
                ErrorAlert("Payment failed.");
              },

              onClose: () => {
                console.log("Snap popup closed");
              },
            });

            SuccessAlert("Payment successful!");
            const res = await api.get("/bookings/mine");
            setBookings(res.data);
          },
          onError: function (error) {
            console.error("Payment Error:", error);
            ErrorAlert("Payment failed. Please try again.");
          },
        });
      } else {
        ErrorAlert("Snap library not loaded. Please check your integration.");
      }
    } catch (err) {
      console.error("Upgrade Error:", err.response || err.message);
      const errors =
        err.response?.data?.message || err.message || "Something went wrong!";
      ErrorAlert(errors, "Upgrade Failed");
    }
  };

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  function formatTime(timeStr) {
    return timeStr.slice(0, 5); // contoh: "07:00:00" → "07:00"
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 bg-gray-50 min-h-screen rounded-lg shadow-lg">
      <h2 className="text-3xl font-extrabold mb-8 text-gray-800 flex items-center gap-2">
        <span role="img" aria-label="Booking">
          📋
        </span>{" "}
        My Booking
      </h2>

      {loading ? (
        <div className="flex items-center gap-3 text-base text-gray-500 py-8 justify-center">
          {/* ...loading spinner... */}
        </div>
      ) : bookings.length === 0 ? (
        <>
          <div className="flex flex-col items-center py-16 space-y-4">
            <span className="text-6xl text-gray-400">📅</span>
            <p className="text-gray-500 text-lg">Belum ada booking.</p>
          </div>
        </>
      ) : (
        <div className="space-y-8">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="border border-gray-200 rounded-xl p-6 shadow-md bg-white hover:shadow-lg transition-shadow duration-200 flex flex-col md:flex-row gap-6"
            >
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-700 mb-1">
                    {b.Court?.name ?? "Unknown Court"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2 flex items-center">
                    <span className="inline-block mr-1 text-gray-400">📍</span>
                    {b.Court?.location ?? "Unknown Location"}
                  </p>
                  <div className="flex flex-col gap-1 text-gray-600">
                    <p>
                      <span className="font-semibold">Tanggal:</span>{" "}
                      {b.date ? formatDate(b.date) : "Unknown Date"}
                    </p>
                    <p>
                      <span className="font-semibold">Waktu:</span>{" "}
                      {b.timeStart ? formatTime(b.timeStart) : "?"} -{" "}
                      {b.timeEnd ? formatTime(b.timeEnd) : "?"}
                    </p>
                  </div>
                </div>
                {/* Status Booking dan Pembayaran diletakkan dalam satu container agar tidak terlalu jauh */}
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex flex-row gap-4 items-center">
                    <span className="font-semibold text-gray-700">
                      Status Booking:
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        b.status === "confirmed"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : b.status === "pending"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : b.status === "approved"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {b.status
                        ? b.status.charAt(0).toUpperCase() + b.status.slice(1)
                        : "Unknown"}
                    </span>
                    <span className="font-semibold text-gray-700 ml-4">
                      Pembayaran:
                    </span>
                    <div>
                      {b.Payment?.status === "paid" ? (
                        <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                          {/* ...icon... */}
                          Sudah Dibayar
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200 w-fit">
                          {/* ...icon... */}
                          Belum Bayar
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 flex flex-col items-center">
                {b.Court?.imageUrl && (
                  <img
                    src={b.Court.imageUrl}
                    alt={b.Court?.name ?? "Court Image"}
                    className="w-44 h-32 object-cover rounded-lg border border-gray-200 shadow"
                  />
                )}
                {b.Payment?.status !== "paid" &&
                  (b.status === "confirmed" || b.status === "approved") && (
                    <>
                      <button
                        className="mt-4 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-sm font-semibold transition-all duration-150 flex items-center gap-2 w-fit"
                        onClick={() => handlePayment(b.id)}
                        title="Bayar booking ini"
                      >
                        {/* ...icon... */}
                        <span className="font-semibold">Bayar Sekarang</span>
                      </button>
                      <div className="mt-2 text-xs text-gray-500 text-center max-w-[180px]">
                        Silakan klik tombol{" "}
                        <span className="font-semibold text-blue-600">
                          Bayar Sekarang
                        </span>{" "}
                        untuk menyelesaikan pembayaran melalui Midtrans.
                      </div>
                    </>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
