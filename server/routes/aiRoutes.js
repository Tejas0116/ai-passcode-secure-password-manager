const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { analyzePassword, detectPhishing, securityTips } = require('../controllers/aiController');

router.post('/password-analysis', protect, analyzePassword);
router.post('/phishing-detection', protect, detectPhishing);
router.post('/security-tips', protect, securityTips);

module.exports = router;
