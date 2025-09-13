import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { googleAuth } from './auth';
import queryString from 'query-string';

const Google = ({ googleAuth }) => {
    let location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const values = queryString.parse(location.search);
        const state = values.state ? values.state : null;
        const code = values.code ? values.code : null;

        // State and code extracted from URL

        if (state && code) {
            googleAuth(state, code).then(success => {
                if (success) {
                    navigate('/');
                } else {
                    navigate('/login');
                }
            });
        } else {
            navigate('/login');
        }
    }, [location, navigate, googleAuth]);

    return null;
};

export default connect(null, { googleAuth })(Google);