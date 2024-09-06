
import React, {useEffect, useState} from 'react';
import { SendOutlined, MoreOutlined } from '@ant-design/icons';
import { Input, Button, Checkbox, Form, Dropdown, Menu } from "antd";
import {socket} from '../socket';

import { REACT_APP_API_URL, CONVERSATION_ID } from '../setupEnv';
import { useAuth } from '../contexts/AuthContext';
import { useGroupContext } from '../contexts/GroupContext';
import ManageMembersModal from './ManageMembersModal';


type RegisteredUser = {
    id: number,
    firstName: string
}
interface Props{
    registeredUsers: RegisteredUser[],
    // setRegisteredUsers: React.Dispatch<React.SetStateAction<RegisteredUser[]>>;
}

const ChatPane: React.FC<Props> = ({registeredUsers}) => {
    const { tokenDetails } = useAuth() as any;
    const {groupDetails, setGroupToken} = useGroupContext() as any;
    const [editing, setEditing] = useState(false);
    const [editedMessage, setEditedMessage] = useState("edit");
    const [isModalVisible, setIsModalVisible] = useState(false); //Manage Members modal
    const [formData, setFormData] = useState<{ message: string }>({
        message: ""
    });
    const [messages, setMessages] = useState<{ message: string, isSent: boolean, name: string, conversationId: number }[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            message: value
        }));
    }

    // //Write a useeffect hook to listen to the chat message event from the server
    // useEffect(() => {
    //     socket.on('user-joined', (name: string) => {
    //         console.log('User joined>', name, Number(CONVERSATION_ID));
    //         setMessages([...messages, { message: `${name} joined the chat`, isSent: false, name: '', conversationId: Number(CONVERSATION_ID)}]);
    //     });

    //     socket.on('chat-message', (msg: {message: string, name: string}) => {
    //         // console.log('Message received>', msg);
    //         setMessages([...messages, { message: msg.message, isSent: false, name: msg.name, conversationId: Number(CONVERSATION_ID)}]);
    //         console.log("messages>", messages);
    //     });
    // }, [messages]);

    // //write a useeffect hook that loads all chat messages via api call
    // useEffect(() => {
    //     const fetchMessages = async() => {
    //         const token = JSON.parse(sessionStorage.getItem('token') || "{}");
    //         console.log("Token>", CONVERSATION_ID);

    //         const response = await fetch(`${REACT_APP_API_URL}/getChatMessages?conversationId=${CONVERSATION_ID}&userId=${token.id}`, {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             }
    //         });
    //         const data = await response.json();
    //         console.log("Chat messages>", data);
    //         setMessages(data.messages);
    //     }
    //     fetchMessages();
    // }, []);

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        //get the message from the input
        const message = formData.message;
        //make an api call to get username by passing senderId
        const response = await fetch(`${REACT_APP_API_URL}/getUsername?id=${tokenDetails.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        const name = data.name;
         

        // console.log('Message>', message);
        const messageSignature = { message: message, isSent: true, name: name, conversationId: Number(CONVERSATION_ID)};//hardcoded conversationId for now
        //send the message to the server
        if (message) {
            socket.emit('new-chat-message', {...messageSignature, senderId: tokenDetails.id});
        }

        //append the message to the list of messages
        setMessages([...messages, messageSignature]);
        console.log("chat messages", messages);


        //clear the input
        setFormData((prev) => ({
            ...prev,
            message: ""
        }));

    }

    const handleEdit = () => {
        console.log("entered edit mode");
        setEditing(true);
    };

    const handleSave = () => {
        setEditing(false);
        // onEdit(editedMessage);
    };

    const handleManageMembersClick = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
    setIsModalVisible(false);
    };

    const menu = (
        <Menu>
          <Menu.Item key="view-members" onClick={handleManageMembersClick}>
            <p style={{margin:0}}>Manage Members</p>
          </Menu.Item>
        </Menu>
    );

return (
    <>
    <ManageMembersModal
        groupDetails={groupDetails}
        visible={isModalVisible}
        onClose={handleCloseModal}
        registeredUsers={registeredUsers}
    />

    <div style={{ width: '80%', display: 'flex', flexDirection: 'column', height: '64vh' }}>
      {/* Fixed title */}
      <div className="chat-name" style={{ borderBottom: '0.8px solid #ccc', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ marginTop: '1rem' }}>{groupDetails.name}</h2>
        
        <Dropdown overlay={menu} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
        </div>

      {/* Scrollable messages container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflowY: 'auto',
          padding: '10px',
        }}
        className="messages-container"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: msg.isSent ? 'row-reverse' : 'row',
              alignItems: 'center',
              margin: '5px',
            }}
          >
            {msg.name !== '' && (
              <div
                style={{
                  alignSelf: msg.isSent ? 'flex-end' : 'flex-start',
                  backgroundColor: '#F5EFE6',
                  padding: '8px',
                  borderRadius: '15px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ marginLeft: '0px' }}>{!msg.isSent && `${msg.name}: `}</div>

                  {msg.isSent && editing ? (
                    <Form layout="inline">
                      <Form.Item>
                        <Input value={editedMessage} onChange={(e) => setEditedMessage(e.target.value)} />
                      </Form.Item>
                      <Form.Item>
                        <Button type="primary" onClick={handleEdit}>
                          Save
                        </Button>
                      </Form.Item>
                    </Form>
                  ) : (
                    <div
                      style={{
                        alignSelf: 'flex-start',
                        backgroundColor: '#F5EFE6',
                        padding: '8px',
                        borderRadius: '15px',
                      }}
                    >
                      {msg.message}
                    </div>
                  )}
                </div>
              </div>
            )}
            {msg.name === '' && (
              <div
                style={{
                  alignSelf: msg.isSent ? 'flex-end' : 'flex-start',
                  color: '#004a76',
                  padding: '8px',
                  borderRadius: '15px',
                }}
              >
                {msg.message}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fixed input box */}
      <form
        style={{
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            padding: '10px',
            borderTop: '0.8px solid #ccc',
            flexShrink: 0,
        }}
        className="input-box"
        onSubmit={handleSubmit}
      >
        <Input
          style={{
            width: '100%',
            minHeight: '20px',
            borderRadius: '5px',
            marginLeft: '5px',
            cursor: 'pointer',
            backgroundColor: '#E8DFCA',
          }}
          placeholder="Type your message here"
          name="message"
          value={formData.message}
          onChange={(e) => handleChange(e)}
        />
        <button type="submit" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
          <SendOutlined style={{ fontSize: '24px', color: '#1890ff', margin: '5px' }} />
        </button>
      </form>
    </div>
    
</>
);

}


export default ChatPane;