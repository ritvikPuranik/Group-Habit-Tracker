import express, { Request, Response, NextFunction } from 'express';

import Messages from '../controllers/messageController';
const router = express.Router();

router.get('/getChatMessages', async(req, res) => {
    const {conversationId, userId} = req.query;
    console.log("userId>>", userId);
    const messages = await Messages.getChatMessages(Number(userId), Number(conversationId));//the user id is matched with sender_id to determine isSent
    res.status(200).send({messages: messages});
});


export default router;