(function () {
  try {
    var _fetch = window.fetch;
    if (_fetch) {
      Object.defineProperty(window, 'fetch', {
        get: function () { return _fetch; },
        set: function (v) { _fetch = v; },
        configurable: true,
        enumerable: true
      });
    }
  } catch (e) {
    // ignore
  }
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
