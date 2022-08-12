const router = require('express').Router();
const {
  getAllIdentity,
  getSingleIdentity,
  verifyIdentity,
  updateVerification,
} = require('../controllers/identityVerification.js');
const auth = require('../middlewares/authentication');
const { upload } = require('../utils/multer');

const fileUpload = upload.fields([{ name: 'idImage' }, { name: 'selfie' }]);
router
  .route('/')
  .post(auth, fileUpload, verifyIdentity)
  .get(auth, getAllIdentity);
router.route('/:id').get(getSingleIdentity).patch(auth, updateVerification);

module.exports = router;
