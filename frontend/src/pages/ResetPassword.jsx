import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { reset_password } from '../components/auth'

import '../styles/input.css';
import '../styles/settings.css';
import { GrNext } from "react-icons/gr";

const ResetPassword = ({ reset_password, passwordResetSuccess }) => {
    const [requestSent, setRequestSent] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
    });

    const { email } = formData;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const success = await reset_password({ email });
        if (success) {
            setRequestSent(true);
            navigate('/');
        }
    };

    useEffect(() => {
        if (requestSent) navigate('/')
    }, [requestSent]);

    return (
        <div className="settings ">
            <form onSubmit={onSubmit}>
                <div className='flex flex-col items-center justify-center'>
                    <h3>Request Password Reset:</h3>
                    <div className="group mt-4">
                        <input
                            type="email"
                            className="input-bar"
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                        />
                        <label>Email</label>
                    </div>
                </div>

                <button className='press float-right flex items-center justify-end' type='submit'>
                    Submit
                    <GrNext className="w-4 h-4 ml-1"/>
                </button>
            </form>
        </div>
    );
};

const mapStateToProps = (state) => ({
    passwordResetSuccess: state.auth.passwordResetSuccess
});

export default connect(mapStateToProps, { reset_password })(ResetPassword);
