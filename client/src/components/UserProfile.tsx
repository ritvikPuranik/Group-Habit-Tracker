import React from 'react';
import { Dropdown, Menu, Button, Badge } from 'antd';
import { useAuth } from '../AuthContext';
import { UserOutlined } from '@ant-design/icons';

const UserProfile: React.FC = () => {
    const { tokenDetails, setToken } = useAuth() as { tokenDetails: {id: number, email: string}, setToken: (tokenData: {id: number, email: string}) => void };
    const handleLogout = () => {
        setToken({id:0, email:''});   
        sessionStorage.clear();
    };

    const NumberedIcon = ({ number }) => (
        <Badge count={number} style={{ backgroundColor: '#52c41a' }}>
          <UserOutlined style={{ fontSize: '24px' }} />
        </Badge>
      );

    const menu = (
        <Menu>
            <Menu.Item key="id" disabled>
                Email: {tokenDetails.email}
            </Menu.Item>
            <Menu.Item key="logout" onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    return (
        <div className="dropdown-container">
            <Dropdown overlay={menu} trigger={['click']} placement="topRight">
                <Button className="dropdown-button" type="primary" shape="circle" icon={<NumberedIcon number={tokenDetails.id} />} />
            </Dropdown>
        </div>
    );
};

export default UserProfile;