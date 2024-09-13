
import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { SendOutlined, MoreOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Input, Button, Checkbox, Form, Dropdown, Menu, Card, Tooltip } from "antd";
import {socket} from '../socket';

import { REACT_APP_API_URL } from '../setupEnv';
import { useAuth } from '../contexts/AuthContext';
import { useGroupContext } from '../contexts/GroupContext';
import ManageMembersModal from './ManageMembersModal';


type RegisteredUser = {
    id: number,
    firstName: string
}

type Message = {
  id: number,
  message: string,
  senderId: number,
  senderName: string,
  groupId: number,
  type: string
}
interface Props{
    registeredUsers: RegisteredUser[],
    // setRegisteredUsers: React.Dispatch<React.SetStateAction<RegisteredUser[]>>;
}

const ChatPane: React.FC<Props> = ({registeredUsers}) => {
    const navigate = useNavigate();
    const { tokenDetails } = useAuth() as any;
    const {groupDetails} = useGroupContext() as any;
    const [editing, setEditing] = useState(false);
    const [editedMessage, setEditedMessage] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false); //Manage Members modal
    const [formData, setFormData] = useState({message: ""});
    const [messages, setMessages] = useState<Message[]>([]);
    const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    let prevMessageSender = '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            message: value
        }));
    }

    //Write a useeffect hook to listen to the chat message event from the server
    useEffect(() => {
        // socket.on('user-joined', (name: string) => {
        //     console.log('User joined>', name, Number(CONVERSATION_ID));
        //     setMessages([...messages, { message: `${name} joined the chat`, isSent: false, name: '', conversationId: Number(CONVERSATION_ID)}]);
        // });

        const handleNewChatMessage = (msg: Message) => {
          const { groupId, message, type, senderId, senderName, id } = msg;
          setMessages((prevMessages) => [
              ...prevMessages,
              { id, message, senderName, groupId: Number(groupId), senderId, type },
          ]);
        };

        socket.on('chat-message', handleNewChatMessage);

        return () => {
          socket.off('chat-message', handleNewChatMessage);
        };
    }, []);

    // useeffect hook that loads all chat messages via api call
    useEffect(() => {
        const fetchMessages = async() => {
          console.log("fetching details with group id>", groupDetails.id);
            const response = await fetch(`${REACT_APP_API_URL}/chat/getChatMessages?groupId=${groupDetails.id}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if(!response.ok){
              alert("Unauthorized! Please login again");
              navigate('/');

            } 
            const data = await response.json();
            console.log("Chat messages>", data);
            setMessages(data.messages);
        }
        fetchMessages();
    }, [groupDetails]);//The conversations should be loaded whenever user changes the group

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        //get the message from the input
        const message = formData.message;

        // console.log('Message>', message);
        const messageSignature = { message: message, senderName: tokenDetails.firstName, senderId: tokenDetails.id, groupId: groupDetails.id, type: 'user'};
        console.log("messageSignature>>", messageSignature);
        if (message) {
            socket.emit('new-chat-message', messageSignature);
        }

        //clear the input
        setFormData((prev) => ({
            ...prev,
            message: ""
        }));

    }

    const handleEdit = (id) => {
        console.log("entered edit mode>>", id);
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

    const isSameSender = (curSender: string): boolean =>{
      if(curSender === prevMessageSender){
        prevMessageSender = '';
        return false;
      } 
      prevMessageSender = curSender;
      return true;
    }

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
      <div
        className="chat-name"
        style={{
          borderBottom: '0.8px solid #ccc',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
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
        {messages &&
          messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: tokenDetails.id === msg.senderId ? 'row-reverse' : 'row',
                margin: isSameSender(msg.senderName) ? '0px' : '5px',
                marginLeft: isSameSender(msg.senderName) ? '5px' : '0px',
              }}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: tokenDetails.id === msg.senderId ? 'flex-end' : 'flex-start',
                  maxWidth: '60%',
                  position: 'relative',
                }}
              >
                {/* Display sender's name above the message bubble */}
                {isSameSender(msg.senderName) && !(tokenDetails.id === msg.senderId) && (
                  <div
                    style={{
                      marginBottom: '4px',
                      color: '#bdbbbb',
                    }}
                  >
                    {msg.senderName}
                  </div>
                )}

                <Card
                  style={{
                    alignSelf: tokenDetails.id === msg.senderId ? 'flex-end' : 'flex-start',
                    backgroundColor: tokenDetails.id === msg.senderId ? '#E6F7FF' : '#F5EFE6',
                    borderRadius: '15px',
                    wordBreak: 'break-word',
                    borderTopRightRadius: tokenDetails.id === msg.senderId ? '0px' : '15px',
                    borderTopLeftRadius: tokenDetails.id === msg.senderId ? '15px' : '0px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                  }}
                  bodyStyle={{
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Message content */}
                  {editingMessageId === msg.id ? (
                    <Form layout="inline">
                      <Form.Item>
                        <Input
                          value={editedMessage}
                          onChange={(e) => setEditedMessage(e.target.value)}
                          defaultValue={msg.message}
                        />
                      </Form.Item>
                      <Form.Item style={{ display: 'flex' }}>
                        {/* Save button with tick mark */}
                        <Button
                          type="primary"
                          size='small'
                          shape="circle"
                          icon={<CheckOutlined />}
                          onClick={() => {
                            handleEdit(msg.id);
                            setEditingMessageId(null); // Close the editing mode after saving
                          }}
                          style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', marginRight: '3px' }}
                        />

                        {/* Cancel button with cross mark */}
                        <Button
                          type="default"
                          size='small'
                          shape="circle"
                          icon={<CloseOutlined />}
                          onClick={() => setEditingMessageId(null)} // Cancel editing
                          style={{ color: '#ff4d4f', borderColor: '#ff4d4f', marginLeft: '3px' }}
                        />
                      </Form.Item>

                    </Form>
                  ) : (
                    <div>{msg.message}</div>
                  )}

                  {/* Edit Icon for own messages */}
                  { tokenDetails.id === msg.senderId && hoveredMessageId === msg.id && (
                    <Tooltip title="Edit Message">
                      <EditOutlined
                        style={{
                          position: 'relative',
                          top: 0,
                          cursor: 'pointer',
                          color: '#888',
                        }}
                        onClick={() => {
                          setHoveredMessageId(null); 
                          setEditingMessageId(msg.id);
                          setEditedMessage(msg.message);
                        }}
                      />
                    </Tooltip>
                  )}
                </Card>
              </div>
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