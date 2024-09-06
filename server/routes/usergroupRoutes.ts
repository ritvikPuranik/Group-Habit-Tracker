import express, { Request, Response, NextFunction } from 'express';

import Users from '../controllers/userController';
import Groups from '../controllers/groupController';


const router = express.Router();


router.post('/createGroup', async(req: Request, res: Response) =>{
    const {name, creatorId} = req.body;
    console.log("entered createGroup");
    const groupId = await Groups.createNewGroup(name, creatorId);
    console.log("group created successfully>", groupId);
    res.status(201).json({status: true, message: groupId});

});

router.get('/userGroups', async(req: Request, res: Response) =>{
    const id = parseInt(req.query.id as string, 10);
    console.log("user id>", id);

    // Validate if `id` is a number and is not NaN
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
  
    const userGroups = await Users.getUserGroups(id);
    res.status(200).json(userGroups);
})

router.get('/registeredUsers', async(req: Request, res: Response) =>{
  const registeredUsers = await Users.getAllUsers();
  res.status(200).json(registeredUsers);
})

router.post('/addMembersToGroup', async(req: Request, res: Response) =>{
  const {users, groupId} = req.body; 
  const membersAdded = await Users.addMembersToGroup(users, groupId);
  console.log("membersAdded>", membersAdded);
  if(membersAdded.length) res.status(201).json({status: true, membersAdded: membersAdded});
  else res.status(500).json({status: false, message: "Could not add members"});

})


export default router;