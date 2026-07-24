import { useEffect, useState } from "react";
import { api } from "../helpers/http-client";
import EditBookingModal from "../components/EditBookingModal";
import CancelModal from "../components/CancelModal";
import { ErrorAlert, SuccessAlert } from "../helpers/alert";

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [status]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const query = status ? `?status=${status}` : "";
      const response = await api.get(`/bookings${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log("🚀 ~ fetchBookings ~ response.data:", response.data);
      setBookings(response.data);
    } catch (err) {
      console.error("❌ Gagal ambil semua booking:", err);
    }
  };

  function handleCancelClick(id) {
    setSelectedBookingId(id);
    setShowCancelModal(true);
  }
  async function handleConfirmCancel() {
    try {
      await api.patch(`/bookings/${selectedBookingId}/status`, {
        status: "cancelled",
      });
      setShowCancelModal(false);
      fetchBookings();
      SuccessAlert("Bookings cancelled successfully!");
    } catch (err) {
      console.error("Gagal cancel:", err);
      const errors =
        err.response?.data?.message || err.message || "Something went wrong!";
      ErrorAlert(errors, "Cancel Booking Failed");
    }
  }

  async function handleApprove(id) {
    try {
      await api.patch(`/bookings/${id}/status`, {
        status: "approved",
      });
      fetchBookings();
      SuccessAlert("Booking approved successfully!");
    } catch (err) {
      console.error("Gagal approve:", err);
      const errors =
        err.response?.data?.message || err.message || "Something went wrong!";
      ErrorAlert(errors, "Approve Booking Failed");
    }
  }
  const openEditModal = (booking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (updatedForm) => {
    try {
      const token = localStorage.getItem("access_token");
      await api.put(`/bookings/${selectedBooking.id}`, updatedForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowEditModal(false);
      fetchBookings();
      SuccessAlert("Booking updated successfully!");
    } catch (err) {
      console.error("Gagal update booking:", err);
      const errors =
        err.response?.data?.message || err.message || "Something went wrong!";
      ErrorAlert(errors, "Update Booking Failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 bg-white shadow-lg rounded-xl space-y-8 text-gray-900">
      <div>
        <h2 className="text-3xl font-extrabold mb-6 text-gray-800 flex items-center justify-center gap-2">
          All Bookings
        </h2>
        <div className="flex-1 flex flex-col gap-2 sm:flex-row sm:items-center mb-6">
          <div className="w-full sm:w-1/3">
            <select
              className="border border-blue-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 shadow-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        {bookings.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-lg">
            Belum ada booking.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 border-b font-semibold text-left">#</th>
                  <th className="p-3 border-b font-semibold text-left">User</th>
                  <th className="p-3 border-b font-semibold text-left">
                    Court
                  </th>
                  <th className="p-3 border-b font-semibold text-left">Date</th>
                  <th className="p-3 border-b font-semibold text-left">Time</th>
                  <th className="p-3 border-b font-semibold text-left">
                    Payment
                  </th>
                  <th className="p-3 border-b font-semibold text-left">
                    Status
                  </th>
                  <th className="p-3 border-b font-semibold text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 border-b">{i + 1}</td>
                    <td className="p-3 border-b">{b.User?.email}</td>
                    <td className="p-3 border-b">{b.Court?.name}</td>
                    <td className="p-3 border-b">
                      {new Date(b.date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-3 border-b">
                      {b.timeStart} - {b.timeEnd}
                    </td>
                    <td className="p-3 border-b">
                      {b.isPaid ? (
                        <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full border border-red-200">
                          Belum Bayar
                        </span>
                      )}
                    </td>
                    <td className="p-3 border-b">
                      <span
                        className={
                          b.status === "approved"
                            ? "inline-block bg-green-50 text-green-700 font-semibold px-3 py-1 rounded-full border border-green-200"
                            : b.status === "cancelled"
                            ? "inline-block bg-red-50 text-red-700 font-semibold px-3 py-1 rounded-full border border-red-200"
                            : "inline-block bg-yellow-50 text-yellow-700 font-semibold px-3 py-1 rounded-full border border-yellow-200"
                        }
                      >
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-3 border-b text-center">
                      <div className="flex justify-center items-center gap-2">
                        {b.status === "pending" && (
                          <button
                            onClick={() => openEditModal(b)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium shadow transition"
                          >
                            Edit
                          </button>
                        )}
                        {b.status !== "cancelled" && (
                          <button
                            onClick={() => handleCancelClick(b.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-medium shadow transition"
                          >
                            Cancel
                          </button>
                        )}
                        {b.status === "pending" && (
                          <button
                            onClick={() => handleApprove(b.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-medium shadow transition"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {showEditModal && selectedBooking && (
          <EditBookingModal
            booking={selectedBooking}
            onClose={() => setShowEditModal(false)}
            onSubmit={handleEditSubmit}
          />
        )}
      </div>
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
