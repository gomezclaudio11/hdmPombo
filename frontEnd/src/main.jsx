import React from 'react';
import ReactDOM from 'react-dom/client'; // <-- Importar el cliente de ReactDOM
import App from './App.jsx';
import { FilterProvider } from './context/FilterContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FilterProvider>
        <App />
    </FilterProvider>
  </React.StrictMode>
)