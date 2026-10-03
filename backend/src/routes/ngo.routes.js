const express = require('express');
const { listONGs, getONG, createONG, listFollowingONGs, followONG, unfollowONG, updateOng, deleteOng } = require('../controllers/ngo.controller');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authMiddleware, listONGs);
router.get('/following', authMiddleware, listFollowingONGs);
router.get('/:id', authMiddleware, getONG);
router.post('/', authMiddleware, createONG);
router.put('/:id', authMiddleware, updateOng)
router.delete('/:id', authMiddleware, deleteOng)
router.post('/:id/follow', authMiddleware, followONG);
router.delete('/:id/follow', authMiddleware, unfollowONG);

module.exports = router;
