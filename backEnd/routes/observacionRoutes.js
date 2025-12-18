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

module.exports = router;