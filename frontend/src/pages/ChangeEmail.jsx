import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MdArrowBackIosNew } from "react-icons/md";
import api from '../api';
import '../styles/input.css';
import { GrNext } from "react-icons/gr";
import { CHANGE_EMAIL_START, CHANGE_EMAIL_START_FAIL } from '../components/types';

const ChangeEmail = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    
    const [formData, setFormData] = useState({
        new_email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.post('/api/accounts/change-email/', {
                new_email: formData.new_email,
                current_password: formData.password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            dispatch({ 
                type: CHANGE_EMAIL_START
            });
        } catch (err) {
            dispatch({ 
                type: CHANGE_EMAIL_START_FAIL,
            });
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
                <h3 className='mb-5'>Change Email</h3>
                <form onSubmit={handleSubmit}>
                    <div className="group">
                        <input className='input-bar'
                            type='email'
                            name='new_email'
                            value={formData.new_email}
                            onChange={handleChange}
                            required
                        />
                        <label>New Email</label>
                    </div>
                    <div className="group">
                        <input className='input-bar'
                            type='password'
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <label>Confirm Password</label>
                    </div>
                    <button className='press float-right flex items-center justify-end' type='submit'>
                        Send Verification
                        <GrNext className="w-4 h-4 ml-1"/>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangeEmail;