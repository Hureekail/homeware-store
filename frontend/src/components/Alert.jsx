import React, { useEffect, useState } from "react";
import { BsInfoCircle } from "react-icons/bs"; 
import { MdOutlineDoNotDisturb } from "react-icons/md"; 
import { FiAlertTriangle } from "react-icons/fi"; 
import { BsCheck2Circle } from "react-icons/bs"; 
import { useSelector, useDispatch } from "react-redux";
import { REMOVE_ALERT } from './types';
import '../styles/alert.css';
import { motion, AnimatePresence } from "framer-motion";

const container = (delay) => ({
    hidden: {y: -100, opacity:0},
    visible: {
        y: 0,
        opacity: 1,
        transition: {duration: 0.5, delay: delay},
    },
});

export const GlobalAlert = () => {
    const dispatch = useDispatch();
    const { alert } = useSelector(state => state.auth);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (alert) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                dispatch({ type: REMOVE_ALERT });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [alert, dispatch]);

    if (!alert) return null;

    const alertContent = () => {
        switch(alert.type) {
            case 'warning':
                return (
                    <motion.div
                        variants={container(0)}
                        initial='hidden'
                        animate='visible'
                        className={`alert alert-${alert.type}`}>
                        <FiAlertTriangle className="text-9x1 rotate" />
                        <span>{alert.message}</span>
                    </motion.div>
                );
            case 'danger':
                return (
                    <motion.div
                        variants={container(0)}
                        initial='hidden'
                        animate='visible'
                        className={`alert alert-${alert.type}`}>
                        <MdOutlineDoNotDisturb className="text-9x1 shine" />
                        <span>{alert.message}</span>
                    </motion.div>
                );
            case 'info':
                return (
                    <motion.div
                        variants={container(0)}
                        initial='hidden'
                        animate='visible'
                        className={`alert alert-${alert.type}`}>
                        <BsInfoCircle className="text-9x1 spin" />
                        <span>{alert.message}</span>
                    </motion.div>
                );
            default:
                return (
                    <motion.div
                        variants={container(0)}
                        initial='hidden'
                        animate='visible'
                        className={`alert alert-${alert.type}`}>
                        <BsCheck2Circle className="text-9x1 shine" />
                        <span className="m-3">{alert.message}</span>
                    </motion.div>
                );
        }
    };

    return (
        <div>
            <AnimatePresence>
                {show && (
                    <motion.div 
                        className="center"
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        {alertContent()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>        
    );
};