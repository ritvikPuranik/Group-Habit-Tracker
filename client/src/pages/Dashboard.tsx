import React from 'react';
import { useAuth } from 'src/AuthContext';
import UserProfile from 'src/components/UserProfile';
import ChatPane from 'src/components/ChatPane';
import TaskTracker from 'src/components/TaskTracker';
import { socket } from 'src/socket';
import { Button } from 'antd';


const Dashboard: React.FC = () => {
    const { tokenDetails } = useAuth() as { tokenDetails: {id: number} };
    console.log("Entered Dashboard>", tokenDetails);
    return (
        <div style={{display: 'block'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Group Habit Tracker</h1>
                <UserProfile />
            </div>
            {/* <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', boxShadow:'2px 2px 15px black', minHeight: '500px', maxHeight:'500px', borderRadius:'10px' }}>
                <ChatPane />
                <TaskTracker />
            </div> */}
        </div>
    );
};

export default Dashboard;