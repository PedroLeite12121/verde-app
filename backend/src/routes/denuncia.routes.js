const express = require('express');
const { listDenuncias, getDenuncia, createDenuncia, updateDenuncia } = require('../controllers/denuncia.controller');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authMiddleware, listDenuncias);
router.get('/:id', authMiddleware, getDenuncia);
router.post('/', authMiddleware, createDenuncia);
router.put('/:id', authMiddleware, updateDenuncia);

module.exports = router;
