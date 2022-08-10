const router = require('express').Router();
const { getUsers, getUser, deleteUser } = require('../controllers/users');
const auth = require('../middlewares/authentication');

router.route('/').get(getUsers);
router.route('/:id').get(auth, getUser);
router.route('/delete/:id').delete(deleteUser);

module.exports = router;
