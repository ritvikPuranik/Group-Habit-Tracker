import React, { useEffect, useState } from 'react';
import { Divider } from 'antd';

import { useAuth } from '../contexts/AuthContext';
import { GroupContextProvider } from '../contexts/GroupContext';
import UserProfile from 'src/components/UserProfile';
import ChatsList from 'src/components/ChatsList';
import ChatPane from 'src/components/ChatPane';
import TaskTracker from 'src/components/TaskTracker';
import { socket } from 'src/socket';
import { REACT_APP_API_URL } from '../setupEnv';


type RegisteredUser = {
    id: number,
    firstName: string
}

const Dashboard: React.FC = () => {
    const { tokenDetails } = useAuth() as { tokenDetails: {id: number} };
    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);

    useEffect(()=>{
        const getRegisteredUsers = async () =>{
            try{
                const response: any = await fetch(`${REACT_APP_API_URL}/usergroups/registeredUsers`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if(!response.ok) throw new Error(`Couldn't get registered users. API Failed`);
                const responseJson = await response.json();
                const mappedStructure = responseJson.map(item=> ({id: item.id, firstName: item.first_name}))
                setRegisteredUsers(mappedStructure);

            }catch(err){
                console.log("Error:", err);
            }
        }

        getRegisteredUsers();
    }, []);

    // console.log("Entered Dashboard>", tokenDetails);
    return (
        <div style={{display: 'block'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>HabitHub</h1>
                <UserProfile />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', boxShadow:'2px 2px 15px black', minHeight: '500px', maxHeight:'500px', borderRadius:'10px' }}>
                <GroupContextProvider >
                    <ChatsList registeredUsers={registeredUsers} />
                    <Divider type='vertical' style={{ marginLeft: 0, height: '90%'}}/>
                    <ChatPane registeredUsers={registeredUsers}/>
                    <Divider type='vertical' style={{ marginRight: 0, height: '90%'}}/>
                    <TaskTracker />
                </GroupContextProvider>
            </div>
        </div>
    );
};

export default Dashboard;