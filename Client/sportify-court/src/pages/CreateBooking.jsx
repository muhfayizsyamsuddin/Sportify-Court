import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { api } from "../helpers/http-client";
// import axios from "axios";
import { ErrorAlert, SuccessAlert } from "../helpers/alert";

export default function BookingForm() {
  const { id } = useParams(); // court ID
  const navigate = useNavigate();
  const [court, setCourt] = useState(null);
  const [date, setDate] = useState("");
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [loading, setLoading] = useState(false);

  const [preference, setPreference] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  // Ambil detail lapangan berdasarkan ID
  useEffect(() => {
    async function fetchCourt() {
      try {
        const res = await api.get(`/public/courts/${id}`);
        setCourt(res.data);
        SuccessAlert("Court fetched successfully!");
      } catch (err) {
        console.error("Gagal fetch court:", err);
        const errors =
          err.response?.data?.message || err.message || "Something went wrong!";
        ErrorAlert(errors, "Fetch Court Failed");
      }
    }
    fetchCourt();
  }, [id]);

  async function handleRecommendation() {
    setLoadingAi(true);
    console.log("🧠 AI Recommendation: Memulai permintaan ke backend...");
    try {
      // const response = await axios.post("http://localhost:3000/ai/recommend", {
      const response = await api.post("/ai/recommend", {
        courtId: id,
        preference,
        availableSlots: [
          "2025-07-25 07:00 - 08:00",
          "2025-07-25 16:00 - 17:00",
          "2025-07-26 09:00 - 10:00",
        ],
      });
      console.log("📦 Rekomendasi dari AI:", response.data);
      console.log("📩 Text rekomendasi:", response.data.recommendation);
      // setRecommendation("Saran: Booking jam 7 pagi atau jam 4 sore.");
      setRecommendation(response.data.recommendation || "Tidak ada hasil.");
      SuccessAlert("AI recommendation fetched successfully!");
    } catch (err) {
      console.error(err);
      const errors =
        err.response?.data?.message || err.message || "Something went wrong!";
      ErrorAlert(errors, "AI Recommendation Failed");
    } finally {
      setLoadingAi(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/bookings", {
        CourtId: id,
        date,
        timeStart,
        timeEnd,
      });
      SuccessAlert("Bookings created successfully!");
      navigate("/bookings/mine");
    } catch (err) {
      console.error("❌ Gagal booking:", err);
      const errors =
        err.response?.data?.message || err.message || "Something went wrong!";
      ErrorAlert(errors, "Create Booking Failed");
    } finally {
      setLoading(false);
    }
  };

  if (!court) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="max-w-xl mx-auto px-6 py-10 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-extrabold mb-6 text-gray-800 text-center">
          Booking: <span className="text-green-600">{court.name}</span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-2 text-gray-700">
              Tanggal
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-semibold mb-2 text-gray-700">
                Waktu Mulai
              </label>
              <input
                type="time"
                required
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-2 text-gray-700">
                Waktu Selesai
              </label>
              <input
                type="time"
                required
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-lg shadow transition ${
              loading
                ? "bg-green-300 text-white cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {loading ? "Memproses..." : "Booking Sekarang"}
          </button>
          <hr className="my-6 border-gray-200" />

          {/* AI Recommendation Section */}
          <div className="space-y-3">
            <label className="block font-semibold mb-2 text-gray-700">
              Preferensi Booking
            </label>
            <input
              type="text"
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
              placeholder="Contoh: pagi hari, cuaca cerah"
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              type="button"
              onClick={handleRecommendation}
              disabled={loadingAi}
              className={`w-full py-3 rounded-lg font-bold text-lg shadow transition ${
                loadingAi
                  ? "bg-blue-300 text-white cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loadingAi ? "Memproses..." : "Rekomendasikan Waktu Booking (AI)"}
            </button>

            {recommendation && (
              <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-lg shadow-sm mt-2">
                <strong>Rekomendasi AI:</strong> {recommendation}
              </div>
            )}
          </div>
          {loadingAi && (
            <p className="text-sm text-gray-500 text-center mt-2">
              Sedang memproses AI...
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
