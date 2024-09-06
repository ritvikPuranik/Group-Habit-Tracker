import React, { useEffect, useState } from 'react';
import type { MenuProps } from 'antd';
import { PlusCircleTwoTone } from '@ant-design/icons';
import { Menu, Button, Modal } from 'antd';
import { REACT_APP_API_URL } from '../setupEnv';
import { useAuth } from 'src/contexts/AuthContext';
import { useGroupContext } from '../contexts/GroupContext';

import NewGroupModal from './NewGroupModal';


type GroupItem = {
    key: string;
    label: string;
    admin: number;
}
type RegisteredUser = {
    id: number,
    firstName: string
}

const ChatsList: React.FC = () => {
    const { tokenDetails } = useAuth() as any;
    const {groupDetails, setGroupToken} = useGroupContext() as any;
    const [groups, setGroups] = useState<GroupItem[]>([]);
    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);

    const [open, setOpen] = useState(false);

    const showModal = () => {
        setOpen(true);
    };

    useEffect(() => {
        const getUserGroups = async () => {
            try {
                const response: any = await fetch(`${REACT_APP_API_URL}/usergroups/userGroups?id=${tokenDetails.id}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) throw new Error('Cannot Get user Chats');

                const responseJson = await response.json();
                const groups = responseJson.map((item, index) => ({
                    key: String(item.id), // Convert index to string since keys are expected to be strings
                    label: item.name,
                    admin: item.admin
                }));
                setGroups(groups);
                console.log("group details>", groupDetails);
                if (!groupDetails.id && groups.length > 0) { //should only be set the first time
                    console.log("setting default groupId>", groups[0].key);
                    const {key, label, admin} = groups[0];
                    setGroupToken({ //Sets the first group as context intitially
                        id: parseInt(key),
                        name: label,
                        admin: admin
                    });
                }
            } catch (err) {
                console.log("error while fetching user groups>", err);
            }
        };
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
        getUserGroups();
        getRegisteredUsers();
    }, [groupDetails]);

    const onClick: MenuProps['onClick'] = (e) => {
        console.log('click ', e.key, typeof(e.key));
        // setGroupId(parseInt(e.key)); // Update the groupId when a menu item is clicked
        console.log("groups>", groups);

        const { key, label, admin } = groups.filter(item => item.key === e.key)[0];
        console.log("setting group token>", groupDetails, key, label, admin);
        setGroupToken({
            id: parseInt(key),
            name: label,
            admin: admin
        })
        
    };

    return (
        <>
        {open && 
        (
        <NewGroupModal open={open} setOpen={setOpen} registeredUsers={registeredUsers}/>
        )}

        <div
            style={{
                width: '20%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',    // Align items to the left
                justifyContent: 'flex-start', // Push items to the top
                padding: 0,
                margin: 0,
                height: '65vh',
            }}
        >
            <div style={{ paddingLeft: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '90%'}} >
                <h2>My Chats</h2>
                <PlusCircleTwoTone onClick={showModal}/>
            </div>
            <Menu
                onClick={onClick}
                style={{
                    width: '100%',              // Makes the menu take full width of the container
                    textAlign: 'left',          // Aligns text to the left within the menu items
                    alignSelf: 'flex-start',    // Aligns the menu itself to the start (left) of the container
                }}
                selectedKeys={[String(groupDetails.id)]}
                mode="inline"
                items={groups}
            />
        </div>
        </>
        
    );
};

export default ChatsList;
