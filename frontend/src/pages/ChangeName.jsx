import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MdArrowBackIosNew } from "react-icons/md";
import api from '../api';
import '../styles/input.css';

import { GrNext } from "react-icons/gr";



const ChangeName = () => {
    const navigate = useNavigate();
    const user = useSelector(state => state.auth.user);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.patch('/api/accounts/update-name/', {
                first_name: formData.first_name,
                last_name: formData.last_name,
                current_password: formData.password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            navigate('/settings');
        } catch (error) {
            setError(error.response?.data?.detail || 'Failed to update name');
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className='settings'>
            <Link className="cursor-default" to="/settings">
                <MdArrowBackIosNew className="back w-5 h-5"/>
            </Link>
            <div className="flex flex-col items-center justify-center">
                <h3 className='mb-5'>Change Name</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit} >
                    <div className="group">
                        <input className='input-bar'
                            type='text'
                            name='first_name'
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        <label> First Name </label>
                    </div>
                    <div className="group">
                        <input className='input-bar'
                            type='text'
                            name='last_name'
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        <label> Last Name </label>
                    </div>
                    <div className="group">
                        <input className='input-bar'
                            type='password'
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <label> Confirm Password </label>
                    </div>
                    <button className='press float-right flex items-center justify-end' type='submit'>
                        Update Name
                        <GrNext className="w-4 h-4 ml-1"/>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangeName; 