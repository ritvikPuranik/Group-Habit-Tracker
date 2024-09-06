import React, { useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { REACT_APP_API_URL } from '../setupEnv';
import { useAuth } from 'src/contexts/AuthContext';
import { useGroupContext } from '../contexts/GroupContext';

const { Option } = Select;

interface Props{
    open: boolean,
    setOpen: (value: boolean) => void,
    registeredUsers: RegisteredUsers[],
}

type RegisteredUsers = {
    id: number,
    firstName: string
}



const NewGroupModal: React.FC<Props> = ({open, setOpen, registeredUsers}) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { tokenDetails } = useAuth() as any;
  const { setGroupToken} = useGroupContext() as any;
  const [form] = Form.useForm();

  const createGroup = async(groupName, creatorId):Promise<number> =>{
    try{
        const raw = {
        name: groupName,
        creatorId: creatorId
        }
    
    console.log("req body going>", raw);
    const response: any = await fetch(`${REACT_APP_API_URL}/usergroups/createGroup`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(raw),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) throw new Error('Cannot create group!');

    const responseJson = await response.json();
    setGroupToken({
        id: parseInt(responseJson.message),
        name: groupName,
        admin: creatorId
    });
    
    return responseJson.message;
    }catch(err){
        console.log("Error while creating group>", err);
        
        setConfirmLoading(false);
        messageApi.open({
            type: 'error',
            content: 'Error while creating group',
        });
        return 0;
    }
  }

  const addMembersToGroup = async(users, groupId) =>{
    try{
        console.log("users>", users);
        const response: any = await fetch(`${REACT_APP_API_URL}/usergroups/addMembersToGroup`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                users,
                groupId
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Cannot add members to group!');

    }catch(err){
        console.log("Error while adding members>", err);

        setConfirmLoading(false);
        messageApi.open({
            type: 'error',
            content: 'Error while adding members',
        });
    }

  }

  const handleOk = async () => {
    try {
        setConfirmLoading(true);
        const values = await form.validateFields(); // Validate the form fields
        console.log('Form values:', values);
        const groupId = await createGroup(values.groupName, tokenDetails.id);
        await addMembersToGroup(values.members, groupId);
            
        setTimeout(() => {
            setConfirmLoading(false);
            setOpen(false);
            form.resetFields(); // Reset form fields after successful submission
            message.success('Group created successfully!');
        }, 1000);
    } catch (error) {
            console.log('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <Modal
        title="Create New Group"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
          name="groupForm"
          initialValues={{ members: [] }}
        >
          <Form.Item
            label="Group Name"
            name="groupName"
            rules={[{ required: true, message: 'Please provide a group name!' }]}
          >
            <Input placeholder="Enter group name" />
          </Form.Item>

          <Form.Item
            label="Add Members"
            name="members"
            rules={[{ required: true, message: 'Please add at least one member!' }]}
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Add members by typing names"
              tokenSeparators={[',']}
              filterOption={true}
            >
                {
                    registeredUsers.map(user=>(
                        <Select.Option key={user.id} value={user.id}>
                            {user.firstName}
                        </Select.Option>
                    ))
                }
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default NewGroupModal;