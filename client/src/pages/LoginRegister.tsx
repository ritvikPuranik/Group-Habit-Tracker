import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card } from 'antd';
import { REACT_APP_API_URL, CONVERSATION_ID } from '../setupEnv';
import { useAuth } from '../AuthContext';
import { socket } from 'src/socket';

interface AuthResponse {
    user:{
        id: number;
        email: string;
        firstName: string;
    }
};
const LoginRegister = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const { setToken } = useAuth() as { setToken: (tokenData: {id: number, email: string, firstName: string}) => void };
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
        name: ''
      });

    const handleToggleRegister = () => {
        setShowRegister(!showRegister);
    };
    const handleInputChange = (e) => {
        console.log("credentials>", credentials);
        const { id, value } = e.target;
        setCredentials(prevState => ({
            ...prevState,
            [id]: value,
        }));
    };

    const handleLogin = async() => {
        let responseObj: AuthResponse;
        setLoading(true);
        try{
            console.log("base url>", REACT_APP_API_URL, credentials);
            const response: any = await fetch(`${REACT_APP_API_URL}/login`, {
                method: 'POST',
                credentials: 'include', // Include credentials (cookies)
                body: JSON.stringify({ ...credentials }),
                headers: {
                'Content-Type': 'application/json'
                }
            });
            if(!response.ok) throw new Error("Error in fetching login details");

            responseObj = await response.json();
            console.log("responseObj>", responseObj);
            if(responseObj.user.id) {
                console.log("received id>", responseObj);
                setToken(responseObj.user);
                navigate('/');
                
            }else {
                alert("Login Failed. User not authenticated");
            }
            setLoading(false);

        }catch(err){
            console.log("error in loggin in>", err);
            alert(`Login Failed. ${err}`);
            setLoading(false);
        }
    };

    const handleRegister = async() => {
        let responseObj;
        setLoading(true);
        
        console.log("base url>", REACT_APP_API_URL, credentials);
        console.log("credentials>", credentials);
        const response: any = await fetch(`${REACT_APP_API_URL}/register`, {
            method: 'POST',
            credentials: 'include', // Include credentials (cookies)
            body: JSON.stringify({ ...credentials }),
            headers: {
            'Content-Type': 'application/json'
            }
        });
        responseObj = await response.json(); 
        console.log("response from register usre>", responseObj);
        if(responseObj.user.id) {
            setToken(responseObj.user);
            //emit new user joined event
            const email = credentials.email;
            socket.emit('new-user-joined', {email: email, id: responseObj.id, conversationId: CONVERSATION_ID, firstName: responseObj.firstName});
            navigate('/');
        }else {
            alert("Registration Failed! User already exists");
        }
        
        setLoading(false);
    };

    return (
        <>
            <h1>HabitHub</h1>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height:'45vh' }}>
                    {showRegister ? (
                        <Card title="Register" style={{ width: 300 }}>
                            <Form onFinish={handleRegister}>
                                <Form.Item
                                    name="name"
                                    rules={[{ required: true, message: 'Please enter your first name' }]}
                                >
                                    <Input placeholder="First Name" onChange={handleInputChange}/>
                                </Form.Item>
                                <Form.Item
                                    name="email"
                                    rules={[{ required: true, message: 'Please enter your email' }]}
                                >
                                    <Input placeholder="Email" onChange={handleInputChange}/>
                                </Form.Item>
                                <Form.Item
                                    name="password"
                                    rules={[{ required: true, message: 'Please enter your password' }]}
                                >
                                    <Input.Password placeholder="Password" onChange={handleInputChange}/>
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={loading}>
                                        Register
                                    </Button>
                                </Form.Item>
                                <Button type="link" onClick={handleToggleRegister}>
                                    Back to Login
                                </Button>
                            </Form>
                        </Card>
                    ) : (
                        <Card title="Login" style={{ width: 300 }}>
                            <Form onFinish={handleLogin} >
                                <Form.Item
                                    name="email"
                                    rules={[{ required: true, message: 'Please enter your email'}]}
                                >
                                    <Input placeholder="Email" onChange={handleInputChange} />
                                </Form.Item>
                                <Form.Item
                                    name="password"
                                    rules={[{ required: true, message: 'Please enter your password' }]}
                                >
                                    <Input.Password placeholder="Password" onChange={handleInputChange} />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={loading}>
                                        Login
                                    </Button>
                                </Form.Item>
                                <Button type="link" onClick={handleToggleRegister}>
                                    Register
                                </Button>
                            </Form>
                        </Card>
                    )}
            </div>
        </>
    );
};

export default LoginRegister;