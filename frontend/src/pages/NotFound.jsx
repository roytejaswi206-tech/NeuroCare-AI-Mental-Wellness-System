import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <p className="text-5xl mb-2">😅</p>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Page not found
      </h1>
      <p className="text-gray-500 mb-6">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="nc-btn-primary">Go home</Link>
    </div>
  );
}
