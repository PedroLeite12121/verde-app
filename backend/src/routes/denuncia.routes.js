const express = require('express');
const { listDenuncias, getDenuncia, createDenuncia, updateDenuncia, deleteDenuncia } = require('../controllers/denuncia.controller');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authMiddleware, listDenuncias);
router.get('/:id', authMiddleware, getDenuncia);
router.post('/', authMiddleware, createDenuncia);
router.put('/:id', authMiddleware, updateDenuncia);
router.delete('/:id', authMiddleware, deleteDenuncia)
module.exports = router;
