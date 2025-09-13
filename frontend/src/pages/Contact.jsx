import { AiFillMail } from "react-icons/ai"; 
import { BsFillTelephoneFill } from "react-icons/bs"; 
import { MdPlace } from "react-icons/md"; 
import React, { useState } from "react";
import { GoogleMap } from "../components/GoogleMap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { load_user } from "../components/auth";
import "../styles/input.css";
import "../styles/contact.css";
import { GrNext } from "react-icons/gr";
import { CONTACT_SUCCESS, CONTACT_FAIL } from "../components/types";

import { MdArrowBackIosNew } from "react-icons/md";
import { Link } from 'react-router-dom';




const Contact = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    
    const [formData, setFormData] = useState({
        message: ''
    });

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login');
        }

        dispatch({ type: 'LOADING_START' });
        try {
            const res = await api.post('/api/accounts/contact/', formData);
            dispatch({ type: CONTACT_SUCCESS });
            setFormData({ message: '' });
        } catch (err) {
            dispatch({ type: CONTACT_FAIL });
        } finally {
            dispatch({ type: 'LOADING_END' });
        }
    };

    return (
        <div className="h-screen w-full relative">
            <div className="contact">
                <div className="flex justify-between">
                    <Link className="cursor-default" to="/">
                        <MdArrowBackIosNew className="back w-7 h-7 mt-3"/>
                    </Link>
                    <div className="flex flex-col items-center justify-center m-5">
                        <h3 >Contact Us</h3>
                        If something’s wrong with your order or you need help with a service, we’re here to sort it out. Write us a message or come visit us at our store.
                        
                        <form onSubmit={handleSubmit}>
                            <div className="group mt-3">
                                <textarea
                                    className="input-bar-contact min-h-[150px] resize-none"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    placeholder="Type your message..."
                                />
                            </div>
                            <button className="press float-right flex items-center justify-end mb-5" type="submit">
                                Send Message
                                <GrNext className="w-4 h-4 ml-1"/>
                            </button>
                        </form>
                        <div className="flex justify-between">
                            <div className="float-right flex items-center justify-end m-3">
                                <MdPlace className="w-8 h-8 text-gray-600"/>
                                Tabirna St, 30-32, Kyiv
                            </div>
                            <div className="float-right flex items-center justify-end m-3">
                                <BsFillTelephoneFill className="w-7 h-7 text-gray-600"/>
                                +380 68 123 45 67
                            </div>
                            <div className="float-right flex items-center justify-end">
                                <AiFillMail className="w-7 h-7 text-gray-600" />
                                web.recape@gmail.com
                            </div>
                        </div>
                    </div>
                    <GoogleMap />
                </div>
            </div>
        </div>
    );
};

export default Contact;