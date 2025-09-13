import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { MdArrowBackIosNew } from "react-icons/md";
import { Link } from 'react-router-dom';
import api from '../api';
import '../styles/input.css';
import { VERIFY_NEW_EMAIL_FAIL, VERIFY_NEW_EMAIL_SUCCESS } from '../components/types';

const VerifyEmail = () => {
    const { uidb64, token } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await api.get(`/api/accounts/verify-email/${uidb64}/${token}/`);
                setTimeout(() => {
                    navigate('/settings');
                }, 3000);
                dispatch({ type: VERIFY_NEW_EMAIL_SUCCESS });
            } catch (err) {
                dispatch({ type: VERIFY_NEW_EMAIL_FAIL });
            }
        };

        verifyEmail();
    }, [uidb64, token, navigate, dispatch]);

    return (
        <div className='settings'>
            <Link className="cursor-default" to="/settings">
                <MdArrowBackIosNew className="back w-5 h-5"/>
            </Link>
            <div className="flex flex-col items-center justify-center">
                <h3 className='mb-5'>Email Verification</h3>
            </div>
        </div>
    );
};

export default VerifyEmail; 