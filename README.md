# 🏥 Dashboard de Higiene Hospitalaria

Este es un sistema de Business Intelligence (BI) diseñado para visualizar y analizar el cumplimiento de la higiene de manos en entornos hospitalarios. La aplicación procesa datos de observaciones basadas en los estándares de la OMS y los presenta de forma interactiva.

##  Características principales
- **Métricas en Tiempo Real:** Visualización del porcentaje de cumplimiento global.
- **Análisis por Sector:** Comparativa de cumplimiento entre diferentes áreas del hospital.
- **Ranking Profesional:** Desempeño segmentado por rol profesional (médicos, enfermeros, etc.).
- **Cumplimiento por Momentos:** Análisis detallado basado en los "5 momentos de la higiene de manos" de la OMS.
- **Dashboard Dinámico:** Selector para profundizar en el análisis de personal por sector específico.

##  Tecnologías utilizadas

### Back-End
- **Node.js & Express:** Servidor de API REST.
- **MongoDB & Mongoose:** Base de datos NoSQL y modelado de datos.
- **Helmet:** Middleware de seguridad para proteger cabeceras HTTP.
- **CORS:** Configuración de acceso seguro entre dominios.

### Front-End
- **React:** Biblioteca para la interfaz de usuario.
- **Vite:** Herramienta de construcción rápida para el desarrollo.
- **Chart.js & React-Chartjs-2:** Generación de gráficos dinámicos.
- **Axios:** Cliente HTTP para comunicación con la API.

##  Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/gomezclaudio11/hdmpombo.git](https://github.com/gomezclaudio11/hdmpombo.git)
   cd hdmpombo

2. **Configurar el Back-End:**

        Ir a la carpeta backEnd.

        Crear un archivo .env con tu MONGO_URI y PORT.

        Instalar dependencias: npm install.

        Iniciar: node app.js.

3. **Configurar el Front-End:**

        Ir a la carpeta frontEnd.

        Instalar dependencias: npm install.

        Iniciar el servidor de desarrollo: npm run dev.

**Endpoints de la API**

El servidor expone diversos puntos de acceso para el consumo de datos:

    GET /api/observaciones/global-compliance: Resumen global.

    GET /api/observaciones/stats-sector: Estadísticas por sector.

    GET /api/observaciones/stats-professional: Ranking por rol profesional.

    GET /api/observaciones/stats-moment: Cumplimiento por momentos OMS.

    

> 🔗 **Ver Demo en vivo:** [https://hdmpombo-frontend.onrender.com](https://hdmpombo-frontend.onrender.com)
