const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
} = require('../controllers/conversationController');

const router = express.Router();

router.use(protect); // All conversation routes require authentication

router.get('/', getConversations);
router.post('/', startConversation);
router.get('/:id/messages', getMessages);
router.post(
  '/:id/messages',
  [body('text').trim().notEmpty().withMessage('Message text is required')],
  validate,
  sendMessage
);

module.exports = router;
