import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get("id");

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl border border-gray-100 p-12">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order placed!</h1>
          <p className="text-gray-400 mb-2">Your order #{orderId} is confirmed.</p>
          <p className="text-sm text-gray-400 mb-8">
            We'll notify you when it's shipped. Check your email for details.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/products"
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-3
                         rounded-xl font-semibold transition">
              Continue shopping
            </Link>
            <Link to="/profile"
              className="text-indigo-600 text-sm hover:underline">
              View my orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}