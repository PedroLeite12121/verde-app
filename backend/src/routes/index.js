const express = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const areaRoutes = require('./area.routes');
const ngoRoutes = require('./ngo.routes');
const projetoRoutes = require('./projeto.routes');
const denunciasRoutes = require('./denuncia.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/usuarios', userRoutes);
router.use('/areas', areaRoutes);
router.use('/ongs', ngoRoutes);
router.use('/projetos', projetoRoutes);
router.use('/denuncias', denunciasRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
