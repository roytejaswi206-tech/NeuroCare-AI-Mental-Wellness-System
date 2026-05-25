// Site-wide disclaimer banner. Shown on every page just under the navbar
// so the academic / educational nature is always clear.

export default function Disclaimer() {
  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 text-xs sm:text-sm text-amber-900 text-center">
        <span className="font-medium">Note:</span> This project is developed for
        educational purposes only and does not replace professional medical advice.
      </div>
    </div>
  );
}
