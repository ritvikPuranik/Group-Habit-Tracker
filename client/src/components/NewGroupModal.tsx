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
  const { tokenDetails } = useAuth() as any;
  const { setGroupToken} = useGroupContext() as any;
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
        setConfirmLoading(true);
        const values = await form.validateFields(); // Validate the form fields
        console.log('Form values:', values);
        
        const raw = {
            name: values.groupName,
            creatorId: tokenDetails.id
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
            name: values.groupName,
            admin: tokenDetails.id
        })
            
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