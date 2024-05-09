import { Checkbox, Button } from 'antd';
import React, { useState } from 'react';
import { Modal, Input, Table, theme } from 'antd';
import { REACT_APP_API_URL, CONVERSATION_ID } from '../setupEnv';
import { useAuth } from 'src/AuthContext';
import {socket} from '../socket';
import '../index.css';

export default function TaskTracker() {
    const [tasks, setTasks] = useState<string[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newTask, setNewTask] = useState('');
    const { tokenDetails } = useAuth() as { tokenDetails: {id: number} };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setTasks([...tasks, newTask]);
        setIsModalVisible(false);
        setNewTask('');
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setNewTask('');
    };

    const handleAddTask = () => {
        showModal();
    };

    const handleRemoveTask = async(task: string) => {
        setTasks(tasks.filter((t) => t !== task));
        const response = await fetch(`${REACT_APP_API_URL}/getUsername?id=${tokenDetails.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        const name = data.name;
        

        //emit the new-message
        const messageSignature = { task: task, name: name, conversationId: Number(CONVERSATION_ID), senderId: tokenDetails.id, taskStatus: 'completed'};//hardcoded conversationId for now
        //send the message to the server
        socket.emit('task-update', messageSignature);
    };

    
    return (
        <div style={{ width: '30%', backgroundColor: '#75A47F', minHeight: '500px', maxHeight: '500px' }}>
            <h2>My Tracker</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Button style={{ display: 'block', marginBottom: '10px' }} onClick={handleAddTask}>Add Task</Button>
                <Modal
                    title="Add Task"
                    open={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                >
                    <Input value={newTask} onChange={(e) => setNewTask(e.target.value)} />
                </Modal>
            </div>
            <Table rowClassName='table-row' style={{backgroundColor: '#BACD92'}} dataSource={tasks.map(task => ({ task }))} rowKey={(task) => task.task} pagination={false}>
                <Table.Column
                    dataIndex="task"
                    key="task"
                    render={(text) => <Checkbox value={text} onChange={() => handleRemoveTask(text)} />}
                />
                <Table.Column className='table-cell' dataIndex="task" key="task" />
            </Table>
        </div>
    );
}