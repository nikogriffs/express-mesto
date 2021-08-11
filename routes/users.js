const router = require('express').Router();
const {
  getUsers, getUser, getUserId, updateProfile, updateAvatar,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getUser);
router.get('/:userId', getUserId);
router.patch('/me', updateProfile);
router.patch('/me/avatar', updateAvatar);

module.exports = router;
