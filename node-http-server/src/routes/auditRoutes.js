const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const response = require('../utils/response');

router.get('/login-history', protect, async (req, res, next) => {
  try {
    response.success(res, 'Login history loaded', []);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
