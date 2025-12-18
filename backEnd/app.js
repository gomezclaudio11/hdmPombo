const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose'); 
const cors = require('cors'); 
const observacionRoutes = require("./routes/observacionRoutes")
// Cargar variables de entorno del archivo .env
dotenv.config();

// 2. Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000; // Usa el puerto definido en .env o el 3000

// 3. Conexión a MongoDB (Usando la URI de tu script anterior)
const mongoURI = process.env.MONGO_URI; 

mongoose.connect(mongoURI)
    .then(() => {
        console.log(' Conectado correctamente a MongoDB.');
    })
    .catch((err) => {
        console.error('Error de conexión a MongoDB:', err);
        // Opcional: Salir de la aplicación si la conexión a la DB falla
        process.exit(1); 
    });


// 4. Middlewares Básicos

// Configuración de CORS
const corsOptions = {
    origin: 'http://localhost:5173',  
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json()); // Habilita la lectura de cuerpos JSON en peticiones (req.body)



// 5. Definir la Ruta de Prueba (Endpoint de Bienvenida)
app.get('/', (req, res) => {
    res.send('Servidor de API para el Dashboard de Higiene en funcionamiento.');
});

// 6. Usar las Rutas de la API
app.use('/api/observaciones', observacionRoutes); // <-- 2. Usar las Rutas con prefijo


// 6. Iniciar el Servidor
app.listen(PORT, () => {
    console.log(` Servidor Express escuchando en http://localhost:${PORT}`);
});