import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './gentle-premium.css';
import App from './App';

const rootElement = document.getElementById('root');
if (rootElement.hasChildNodes()) {
  ReactDOM.hydrateRoot(
    rootElement,
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}