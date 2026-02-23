const express = require("express");
const router = express.Router();
const observacionController = require("../controllers/observacionController");
const authController = require("../controllers/authController")
const { auth, checkRole } = require("../middleware/authMiddleware")

// Ruta para obtener el resumen del cumplimiento global
// Acceso: GET /api/observaciones/global-compliance
router.get('/global-compliance', auth, observacionController.getGlobalCompliance);
router.get("/stats-sector", auth, observacionController.getComplianceBySector);
router.get("/stats-professional", auth, observacionController.getComplianceByProfessional)
router.get("/stats-moment", auth, observacionController.getComplianceByMoment)
router.get('/stats-techniques', auth, observacionController.getTechniqueUsage);
router.get('/stats-shift', auth, observacionController.getComplianceByShift);
router.get('/stats-sector-detalle/:nombreSector', auth, observacionController.getStaffComplianceBySector);

//Ruta para registrar usuarios POST api/auth/register
router.post("/register", authController.register)
router.post("/login", authController.login)

module.exports = router;

/**
 La URL del navegador solo muestra la ruta del Frontend (la interfaz). Las rutas de la API 
 son puntos de enlace (endpoints) que mi aplicación de React consulta internamente mediante 
 peticiones asíncronas para obtener los datos de MongoDB sin recargar la página
 */