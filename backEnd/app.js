const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose'); 
const cors = require('cors'); 
const helmet = require("helmet");
const observacionRoutes = require("./routes/observacionRoutes")
const authRoutes = require("./routes/authRoutes")
const { unificarDatosHistoricos } = require ("./controllers/observacionController")

// Cargar variables de entorno del archivo .env
dotenv.config();

// 2. Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000; // Usa el puerto definido en .env o el 3000

// 3. Conexión a MongoDB (Usando la URI de tu script anterior)
const mongoURI = process.env.MONGO_URI; 

mongoose.connect(mongoURI)
    .then(async () => {
        console.log(' Conectado correctamente a MongoDB.');

        // LA LLAMADA MÁGICA:
      console.log("Iniciando unificación de datos...");
      await unificarDatosHistoricos(); //LINEA COMENTADA XQ SOLO SE USA UNA VEZ  
      console.log("Proceso terminado.");
    })
    .catch((err) => {
        console.error('Error de conexión a MongoDB:', err);
        // Opcional: Salir de la aplicación si la conexión a la DB falla
        process.exit(1); 
    });


// 4. Middlewares Básicos

// Configuración de CORS
/**
 (Cross-Origin Resource Sharing o Intercambio de Recursos de Origen Cruzado) es un mecanismo 
 de seguridad que utilizan los navegadores para proteger a los usuarios.
Sirve para decidir si una página web (Frontend) tiene permiso para pedirle cosas a un servidor 
(tu Backend) que está en una dirección diferente.
 */

app.use(cors({
     origin: 'https://hdmpombo-frontend.onrender.com', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'x-auth-token'], //es vital para enviar archivos JSON.
    optionsSuccessStatus: 200 // petición "de prueba" (llamada Preflight) antes de la real.
}));
app.use(express.json()); // Habilita la lectura de cuerpos JSON en peticiones (req.body)
app.use(helmet()); // capas de seguridad contra ataques comunes

// 5. Definir la Ruta de Prueba (Endpoint de Bienvenida)
app.get('/', (req, res) => {
    res.send('Servidor de API para el Dashboard de Higiene en funcionamiento.');
});

// 6. Usar las Rutas de la API
app.use('/api/observaciones', observacionRoutes); // <-- 2. Usar las Rutas con prefijo
app.use("/api/auth", authRoutes)


// 6. Iniciar el Servidor
app.listen(PORT, () => {
    console.log(` Servidor Express escuchando en http://localhost:${PORT}`);
});