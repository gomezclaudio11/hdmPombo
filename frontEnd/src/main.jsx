import React from 'react';
import ReactDOM from 'react-dom/client'; // <-- Importar el cliente de ReactDOM
import App from './App.jsx';

// 1. Obtener el elemento contenedor de la página HTML (normalmente un div con id="root")
const rootElement = document.getElementById('root');

// 2. Crear la raíz de React 18
const root = ReactDOM.createRoot(rootElement);

// 3. Renderizar el componente principal (<App />) dentro de la raíz
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);