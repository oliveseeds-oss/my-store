import React from 'react';

export default function CuteLoader() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", 
      alignItems: "center", justifyContent: "center",
      background: "#FAFAFA"
    }}>
      <style>{`
        .cute-loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .cute-loader-box {
          width: 48px;
          height: 48px;
          background: #1B3931;
          border-radius: 14px;
          position: relative;
          animation: cute-bounce 0.5s alternate infinite cubic-bezier(.5,0.05,1,.5);
          box-shadow: 0 4px 12px rgba(27, 57, 49, 0.2);
        }
        .cute-loader-box::before, .cute-loader-box::after {
          content: '';
          position: absolute;
          top: 16px;
          width: 8px;
          height: 8px;
          background: #FFFFFF;
          border-radius: 50%;
          animation: cute-blink 3s infinite;
        }
        .cute-loader-box::before { left: 12px; }
        .cute-loader-box::after { right: 12px; }
        
        .cute-loader-shadow {
          width: 40px;
          height: 6px;
          background: rgba(0,0,0,0.15);
          border-radius: 50%;
          position: absolute;
          bottom: -10px;
          animation: cute-shadow 0.5s alternate infinite cubic-bezier(.5,0.05,1,.5);
        }
        
        @keyframes cute-bounce {
          0% { transform: translateY(0) scaleY(0.8) scaleX(1.15); }
          100% { transform: translateY(-40px) scaleY(1.05) scaleX(0.95); }
        }
        @keyframes cute-shadow {
          0% { transform: scale(1.2); opacity: 0.4; }
          100% { transform: scale(0.6); opacity: 0.1; }
        }
        @keyframes cute-blink {
          0%, 94%, 100% { transform: scaleY(1); }
          97% { transform: scaleY(0.1); }
        }
      `}</style>
      <div className="cute-loader-container">
        <div className="cute-loader-box"></div>
        <div className="cute-loader-shadow"></div>
      </div>
    </div>
  );
}
