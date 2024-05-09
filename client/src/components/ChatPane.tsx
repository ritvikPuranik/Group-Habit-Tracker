
import React, {useEffect, useState} from 'react';
import { SendOutlined, EditOutlined } from '@ant-design/icons';
import { Input, Button, Checkbox, Form } from "antd";
import {socket} from '../socket';

import { REACT_APP_API_URL, CONVERSATION_ID } from '../setupEnv';
import { useAuth } from 'src/AuthContext';

const ChatPane: React.FC = () => {
    const { tokenDetails } = useAuth() as { tokenDetails: {id: number} };
    const [editing, setEditing] = useState(false);
    const [editedMessage, setEditedMessage] = useState("edit");
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

    //Write a useeffect hook to listen to the chat message event from the server
    useEffect(() => {
        socket.on('user-joined', (name: string) => {
            console.log('User joined>', name, Number(CONVERSATION_ID));
            setMessages([...messages, { message: `${name} joined the chat`, isSent: false, name: '', conversationId: Number(CONVERSATION_ID)}]);
        });

        socket.on('chat-message', (msg: {message: string, name: string}) => {
            // console.log('Message received>', msg);
            setMessages([...messages, { message: msg.message, isSent: false, name: msg.name, conversationId: Number(CONVERSATION_ID)}]);
            console.log("messages>", messages);
        });
    }, [messages]);

    //write a useeffect hook that loads all chat messages via api call
    useEffect(() => {
        const fetchMessages = async() => {
            const token = JSON.parse(sessionStorage.getItem('token') || "{}");
            console.log("Token>", CONVERSATION_ID);

            const response = await fetch(`${REACT_APP_API_URL}/getChatMessages?conversationId=${CONVERSATION_ID}&userId=${token.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            console.log("Chat messages>", data);
            setMessages(data.messages);
        }
        fetchMessages();
    }, []);

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

return (
    <div style={{ width: '70%', backgroundColor: '#BACD92', minHeight: '500px', maxHeight: '500px', display: 'flex', flexDirection: 'column' }}>
        <div className='chat-name' style={{ paddingTop: '10px' }}>
            <h2>Group Chat</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '10px', flex: 1, overflowY:'auto' }} className='messages-container'>
        {messages.map((msg, index) => (
        <div key={index} style={{ display: 'flex', flexDirection: msg.isSent ? 'row-reverse' : 'row', alignItems: 'center', margin: '5px' }}>
            {msg.name !== '' && (
                <div style={{ alignSelf: msg.isSent ? 'flex-end' : 'flex-start', backgroundColor: '#F5EFE6', padding: '8px', borderRadius: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center'}}>
                        <div style={{marginLeft: '0px' }}>
                            {!msg.isSent && `${msg.name}: `}
                        </div>
                        {/* <div style={{ alignSelf: 'flex-start', backgroundColor: '#F5EFE6', padding: '8px', borderRadius: '15px' }}>
                            {msg.message}
                        </div> */}
                        
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
                        ) : 
                        <div style={{ alignSelf: 'flex-start', backgroundColor: '#F5EFE6', padding: '8px', borderRadius: '15px' }}>
                            {msg.message}
                        </div>
                        }
                    </div>
                </div>
            )}
            {msg.name === '' && (
                <div style={{ alignSelf: msg.isSent ? 'flex-end' : 'flex-start', color:'#004a76', padding: '8px', borderRadius: '15px' }}>
                    {msg.message}
                </div>
            )}
            
        </div>
    ))}
        </div>
        <form style={{ display: 'flex', alignItems: 'center', paddingTop: '10px', paddingBottom: '10px' }} className='input-box' onSubmit={handleSubmit}>
            <Input
                style={{ width: '100%', minHeight: '20px', borderRadius: '5px', marginLeft: '5px', cursor: 'pointer', backgroundColor: '#E8DFCA' }}
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
);

}


export default ChatPane;