const router = require('express').Router();
const auth = require('../middlewares/authentication');
const {
  getAllWithdrawal,
  getSingleWithdrawal,
  withdrawFunds,
  processWithdrawal,
} = require('../controllers/withdrawal');

router.route('/').get(auth, getAllWithdrawal).post(auth, withdrawFunds);
router.route('/:id').get(auth, getSingleWithdrawal);
router.route('/process/:id').patch(processWithdrawal);

module.exports = router;
