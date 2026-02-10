const express = require("express");
const router = express.Router();
const observacionController = require("../controllers/observacionController");

// Ruta para obtener el resumen del cumplimiento global
// Acceso: GET /api/observaciones/global-compliance
router.get('/global-compliance', observacionController.getGlobalCompliance);
router.get("/stats-sector", observacionController.getComplianceBySector);
router.get("/stats-professional", observacionController.getComplianceByProfessional)
router.get("/stats-moment", observacionController.getComplianceByMoment)
router.get('/stats-techniques', observacionController.getTechniqueUsage);
router.get('/stats-shift', observacionController.getComplianceByShift);
router.get('/stats-sector-detalle/:nombreSector', observacionController.getStaffComplianceBySector);

module.exports = router;

/**
 La URL del navegador solo muestra la ruta del Frontend (la interfaz). Las rutas de la API 
 son puntos de enlace (endpoints) que mi aplicación de React consulta internamente mediante 
 peticiones asíncronas para obtener los datos de MongoDB sin recargar la página
 */