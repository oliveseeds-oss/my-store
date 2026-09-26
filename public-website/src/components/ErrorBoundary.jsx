import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Studio UI Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF6EE] px-4 py-12">
          <div className="max-w-md w-full bg-white border border-[#EAE4D6] rounded-[6px] p-8 text-center shadow-sm">
            <span 
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className="text-4xl text-[#A48855] block mb-2"
            >
              ✦
            </span>
            <h2 
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className="text-2xl font-normal text-[#181A18] mb-3"
            >
              Experience Paused
            </h2>
            <p className="text-xs text-[#676A65] leading-relaxed mb-6 font-normal">
              An unexpected layout update occurred. The studio concierge has preserved your cart and account details.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                className="w-full py-3 bg-[#23483D] hover:bg-[#16352D] text-white text-xs font-semibold uppercase tracking-wider rounded-[4px] transition cursor-pointer"
              >
                Reload Experience
              </button>
              <a
                href="/"
                className="w-full py-3 bg-white border border-[#EAE4D6] hover:bg-[#FAF6EE] text-[#181A18] text-xs font-semibold uppercase tracking-wider rounded-[4px] transition text-center"
              >
                Return to Studio Home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
