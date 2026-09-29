const express = require('express');
const { adminAuthMiddleware } = require('../middlewares/adminAuth');
const {
  dashboardStats,
  listUsuarios,
  listAreas,
  listONGs,
  listDenuncias,
  listProjetos,
  approveONG,
  rejectONG,
} = require('../controllers/admin.controller');

const router = express.Router();

router.use(adminAuthMiddleware);

router.get('/dashboard', dashboardStats);
router.get('/usuarios', listUsuarios);
router.get('/areas', listAreas);
router.get('/ongs', listONGs);
router.get('/denuncias', listDenuncias);
router.get('/projetos', listProjetos)
router.put('/ong/:id/approve', approveONG)
router.put('/ong/:id/reject', rejectONG)

module.exports = router;
