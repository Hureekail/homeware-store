import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { reset_password_confirm } from '../components/auth'

import '../styles/input.css';
import '../styles/settings.css';
import { GrNext } from "react-icons/gr";

const ResetPasswordConfirm = () => {
    const [requestSent, setRequestSent] = useState(false)
    const [formData, setFormData] = useState({
        new_password: '',
        re_new_password: '',
    })

    const { new_password, re_new_password } = formData

    const { uid, token } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }


    const onSubmit = async (e) => {
        e.preventDefault();
    
        if (new_password !== re_new_password) {
            alert("Passwords do not match!");
            return;
        }
        

        try {
            await dispatch(reset_password_confirm(uid, token, new_password, re_new_password));
            setRequestSent(true);
        } catch (err) {
            // Handle error silently
        }
    };

    if (requestSent) {
        navigate('/');
    }

    return (
        <div className="settings">
            <form onSubmit={e => onSubmit(e)}>
                <div className='flex flex-col items-center justify-center'>
                    <h3>Password Reset:</h3>
                    <div className="group mt-4">
                        <input
                        type="password"
                        className="input-bar"
                        name="new_password"
                        value={new_password}
                        onChange={e => onChange(e)}
                        minLength='6'
                        required />
                        <label> New Password </label>
                    </div>
                    <div className="group">
                        <input
                        type="password"
                        className="input-bar"
                        name="re_new_password"
                        value={re_new_password}
                        onChange={e => onChange(e)}
                        minLength='6'
                        required />
                        <label> Confirm New Password </label>
                    </div>
                </div>
                <button className='press float-right flex items-center justify-end' type='submit'>
                    Submit
                    <GrNext className="w-4 h-4 ml-1"/>
                </button>
            </form>
        </div>
    )
}


export default ResetPasswordConfirm