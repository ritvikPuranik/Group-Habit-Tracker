import React, { useState, useEffect } from 'react';
import { Modal, List, Button, message, Select} from 'antd';
import { useAuth } from '../contexts/AuthContext'; // Importing Auth Context
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { REACT_APP_API_URL } from '../setupEnv';

type Member = {
  id: number;
  firstName: string;
  email: string;
}

type RegisteredUser = {
    id: number,
    firstName: string
}

interface ManageMembersModalProps {
  groupDetails: {
    id: number;
    name: string;
    admin: number;
  };
  visible: boolean;
  onClose: () => void;
  registeredUsers: RegisteredUser[],
}

const ManageMembersModal: React.FC<ManageMembersModalProps> = ({ groupDetails, visible, onClose, registeredUsers }) => {
  const { tokenDetails } = useAuth() as { tokenDetails: { id: number; } };
  const [messageApi, contextHolder] = message.useMessage();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  // Fetch members when the modal is opened
  useEffect(() => {
    if (visible) {
      fetchMembers();
    }
  }, [visible]);

  const addMembersToGroup = async(users, groupId): Promise<Member[]> =>{
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
        const responseJson = await response.json();
        return responseJson.membersAdded;

    }catch(err){
        console.log("Error while adding members>", err);

        setConfirmLoading(false);
        messageApi.open({
            type: 'error',
            content: 'Error while adding members',
        });
        return [];
    }

  }

  const fetchMembers = async () => {
    try {
      // Replace with your API call to fetch group members
    //   const response = await fetch(`/api/groups/${groupDetails.id}/members`);
    //   const data = await response.json();
    const data = [
        {
            id: 1,
            firstName: 'ritvik',
            email: 'ritvik@gmail.com'
        },
        {
            id: 2,
            firstName: 'shashank',
            email: 'shashank@gmail.com'
        }
    ]

    setMembers(data);
    } catch (error) {
      message.error('Failed to load members.');
    }
  };

  const handleAddMember = async () => {
    try {
        console.log("at handleAdd member>", selectedMembers);
        setConfirmLoading(true);
        const newMembers: Member[] = await addMembersToGroup(selectedMembers, groupDetails.id);
        // const newMember = {
        //     id: 3,
        //     firstName: 'ithihas',
        //     email: 'ithihas@gmail.com'
        // }
        console.log("added new members>", newMembers);
        setMembers([...members, ...newMembers]);
        message.success('Member added successfully');
    } catch (error) {
        message.error('Failed to add member.');
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    try {
      // Replace with your API call to remove a member
      const response = await fetch(`/api/groups/${groupDetails.id}/members/${memberId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove member');

      setMembers(members.filter((member) => member.id !== memberId));
      message.success('Member removed successfully');
    } catch (error) {
      message.error('Failed to remove member.');
    }
  };

  const handleSelectChange = (value: number[]) => {
    setSelectedMembers(value);
  };

  return (
    <Modal
      title="Manage Members"
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      <List
        bordered
        dataSource={members}
        renderItem={(member) => (
          <List.Item
            actions={
              (groupDetails.admin === tokenDetails.id)
                ? [<Button icon={<DeleteOutlined />} style={{color: 'red'}} onClick={() => handleRemoveMember(member.id)}>Remove</Button>]
                : undefined
            }
          >
            {member.firstName} ({member.email})
          </List.Item>
        )}
      />
      {(groupDetails.admin === tokenDetails.id) && (
        <div style={{display: 'flex', marginTop: '1.5vh', justifyContent: 'space-between'}}>
          <Select
              mode="tags"
              style={{ marginRight: '10px', flex: 1 }}
              placeholder="Add members by typing names"
              tokenSeparators={[',']}
              filterOption={true}
              onChange={handleSelectChange}
        >
            {
                registeredUsers.map(user=>(
                    <Select.Option key={user.id} value={user.id}>
                        {user.firstName}
                    </Select.Option>
                ))
            }
        </Select>
          <Button type="primary" icon={<PlusOutlined />} style={{ flexShrink: 0 }} onClick={handleAddMember}>
            Add
          </Button>
        </div>
        
      )}
    </Modal>
  );
};

export default ManageMembersModal;
