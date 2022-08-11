const router = require('express').Router();
const {
  getStaticInvestments,
  getStaticWithdrawal,
  updateEarning,
} = require('../controllers/static');
const auth = require('../middlewares/authentication');

router.route('/investments').get(getStaticInvestments);
router.route('/withdrawals').get(getStaticWithdrawal);
router.route('/earning/:id').patch(updateEarning);

module.exports = router;
