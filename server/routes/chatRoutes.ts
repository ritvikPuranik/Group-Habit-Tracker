import express, { Request, Response, NextFunction } from 'express';

import Messages from '../controllers/messageController';
const router = express.Router();

router.get('/getChatMessages', async(req, res) => {
    const {groupId} = req.query;
    const messages = await Messages.getChatMessages(Number(groupId));
    res.status(200).send({messages: messages});
});


export default router;