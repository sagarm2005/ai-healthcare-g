import express from 'express';
const router = express.Router();
import {
    sendMessage,
    getMessages,
    getConversations,
    getAvailableContacts,
    markMessageAsRead,
    deleteMessage,
    deleteAllMessages
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/')
    .post(protect, sendMessage);

router.route('/all').delete(protect, deleteAllMessages);
router.route('/conversations/list').get(protect, getConversations);
router.route('/contacts/available').get(protect, getAvailableContacts);
router.route('/:id/read').put(protect, markMessageAsRead);
router.route('/:userId').get(protect, getMessages);
router.route('/:id').delete(protect, deleteMessage);

export default router;
