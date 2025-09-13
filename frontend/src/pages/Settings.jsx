import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from '../components/auth';
import { DeleteProfile } from "../components/auth";

import { GrNext } from "react-icons/gr";
import { MdArrowBackIosNew } from "react-icons/md";

import { Link } from 'react-router-dom';

import '../styles/settings.css';


const Settings = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        setTimeout(() => {
            navigate('/');
        }, 100);
    };

    const handleDeleteProfile = async () => {
        dispatch(DeleteProfile());
        setTimeout(() => {
            navigate('/');
        }, 100);
    };

    const handleChangeName = () => {
        navigate('/change-name');
    };

    const handleChangeEmail = () => {
        navigate('/change-email');
    };

    return (
        <div>
            <div className='settings'>
                <Link className="cursor-default" to="/">
                    <MdArrowBackIosNew className="back w-5 h-5"/>
                </Link>

                <h4 className="text-center cursor-default">Settings</h4>

                <div onClick={handleChangeEmail} className="press border-b border-gray-200 p-4 flex justify-between">
                    <b className="">Change my Email</b>
                    <GrNext className="w-5 h-5"/>
                </div>
                
                <div onClick={handleChangeName} className="press border-b border-gray-200 p-4 flex justify-between">
                    <b className="">Change my Name</b>
                    <GrNext className="w-5 h-5"/>
                </div>

                <div className="press border-b border-gray-200 p-4 flex justify-between">
                    <b className="">Return my Order</b>
                    <GrNext className="w-5 h-5"/>
                </div>

                <div onClick={handleDeleteProfile} 
                    className="press border-b border-gray-200 p-4 flex justify-between">
                    <b className="">Delete my Account</b>
                    <GrNext className="w-5 h-5"/>
                </div>

                <div onClick={handleLogout} 
                    className="press p-4 flex justify-between">
                    <b className="">Logout</b>
                    <GrNext className="w-5 h-5"/>
                </div>
            </div>
        </div>
    )
}

export default Settings;