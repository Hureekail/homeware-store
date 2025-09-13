import api from "../api";
import Cookies from 'js-cookie';
import axios from 'axios';
import { ACCES_TOKEN, REFRESH_TOKEN } from "../constants";

import {
    USER_LOADED_SUCCESS,
    USER_LOADED_FAIL,
    LOGIN_START,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    SIGNUP_START,
    SIGNUP_SUCCESS,
    SIGNUP_FAIL,
    ACTIVATION_FAIL,
    ACTIVATION_SUCCESS,
    LOGOUT,
    PASSWORD_RESET_SUCCESS,
    PASSWORD_RESET_FAIL,
    PASSWORD_RESET_CONFIRM_SUCCESS,
    PASSWORD_RESET_CONFIRM_FAIL,
    GOOGLE_AUTH_SUCCESS,
    GOOGLE_AUTH_FAIL,
    DELETE_PROFILE_FAIL,
    DELETE_PROFILE_SUCCESS,
    AUTHENTICATED_FAIL,
    AUTHENTICATED_SUCCESS,
} from "./types"


const initializeCsrf = async () => {
    try {
        // Call a GET endpoint to set the CSRF cookie
        await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/csrf/`, { withCredentials: true });
    } catch (error) {
        throw new Error("CSRF token initialization failed");
    }
};


export const load_user = () => async dispatch => {
    if (localStorage.getItem('access')) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Accept': 'application/json'
            }
        }; 

        try {
            const res = await api.get(`/api/auth/users/me/`, config);
    
            dispatch({
                type: USER_LOADED_SUCCESS,
                payload: res.data
            });
        } catch (err) {
            dispatch({
                type: USER_LOADED_FAIL
            });
        }
    } else {
        dispatch({
            type: USER_LOADED_FAIL
        });
    }
};

export const signup = (userData) => async (dispatch) => {
    dispatch({ type: 'LOADING_START' });
    dispatch({ type: SIGNUP_START });
    try {
        await initializeCsrf();
        const csrfToken = Cookies.get('csrftoken');

        // Create user first
        const res = await api.post('api/auth/users/', userData, {
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json'
            }
        });

        // Get guest orders from localStorage
        const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
        
        // Save guest orders if any exist
        if (guestOrders.length > 0) {
            try {
                // Save each order with the user's email
                for (const order of guestOrders) {
                    await api.post('api/orders/', {
                        product_id: order.id,
                        email: userData.email
                    }, {
                        headers: {
                            'X-CSRFToken': csrfToken,
                            'Content-Type': 'application/json'
                        }
                    });
                }
                // Clear guest orders after successful save
                localStorage.removeItem('guestOrders');
            } catch (err) {
                // Don't fail signup if order save fails
            }
        }

        dispatch({ type: SIGNUP_SUCCESS, payload: res.data });
        dispatch({ type: 'LOADING_END' });
        return true;
    } catch (err) {
        dispatch({ type: SIGNUP_FAIL, payload: err.response?.data });
        dispatch({ type: 'LOADING_END' });
        return false;
    }
};


export const verify = (uid, token) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const body = JSON.stringify({ uid, token });

    try {
        const res = await api.post('/api/auth/users/activation/', body, config);
        dispatch({
            type: ACTIVATION_SUCCESS,
            payload: res.data
        });
        return true;
    } catch (err) {
        dispatch({
            type: ACTIVATION_FAIL,
            payload: err.response?.data
        });
        return false;
    }
};



export const login = ({email, password}) => async (dispatch) => {
    dispatch({ type: 'LOADING_START' });
    dispatch({ type: LOGIN_START });
    try {

        await initializeCsrf()
        const csrfToken = Cookies.get('csrftoken');
        const body = JSON.stringify({ email, password });
        const res = await api.post('api/auth/jwt/create/', body, {headers: {'X-CSRFToken': csrfToken, 'Content-Type': 'application/json'}});

        const { access, refresh } = res.data;

        localStorage.setItem(ACCES_TOKEN, access);
        localStorage.setItem(REFRESH_TOKEN, refresh);


        dispatch({ type: LOGIN_SUCCESS, payload: res.data });
        dispatch({ type: 'LOADING_END' });
        return true;
    } catch (err) {
        dispatch({ type: LOGIN_FAIL, payload: err.response?.data });
        dispatch({ type: 'LOADING_END' });
        return false;
    }
};


export const logout = () => ({ type: LOGOUT });


export const reset_password = ({email}) => async (dispatch) => {
    dispatch({ type: 'LOADING_START' });
    
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    
    const body = JSON.stringify({email})

    try {
        const res = await api.post('api/auth/users/reset_password/', body, config)
        dispatch({
            type: PASSWORD_RESET_SUCCESS,
            payload: res.data
        })
        dispatch({ type: 'LOADING_END' });
        return true
    } catch (err) {
        dispatch({
            type: PASSWORD_RESET_FAIL,
            payload: err.response?.data 
        })
        dispatch({ type: 'LOADING_END' });
        return false
    }
};

export const reset_password_confirm = (uid, token, new_password, re_new_password) => async (dispatch) => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = JSON.stringify({uid, token, new_password, re_new_password})

    try {
        await api.post('api/auth/users/reset_password_confirm/', body, config)

        dispatch({
            type: PASSWORD_RESET_CONFIRM_SUCCESS
        })
        return true
    } catch (err) {
        dispatch({
            type: PASSWORD_RESET_CONFIRM_FAIL
        })
    return false
    }
}


export const googleAuth = (state, code) => async dispatch => {
    if (state && code && !localStorage.getItem('access')) {
        try {
            await initializeCsrf();
            
            const csrfToken = Cookies.get('csrftoken');
            
            const config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': csrfToken
                },
                withCredentials: true
            };

            const formBody = new URLSearchParams({
                'state': state,
                'code': code
            }).toString();

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/o/google-oauth2/`, formBody, config);

            // Extract user email from response data
            const userEmail = res.data.user;

            // Get guest orders from localStorage
            const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
            
            // Save guest orders if any exist
            if (guestOrders.length > 0) {
                try {
                    // Save each order with the user's email
                    for (const order of guestOrders) {
                        await api.post('api/orders/', {
                            product_id: order.id,
                            email: userEmail
                        }, {
                            headers: {
                                'X-CSRFToken': csrfToken,
                                'Content-Type': 'application/json'
                            }
                        });
                    }
                    // Clear guest orders after successful save
                    localStorage.removeItem('guestOrders');
                } catch (err) {
                    // Don't fail signup if order save fails
                }
            }
            dispatch({
                type: GOOGLE_AUTH_SUCCESS,
                payload: res.data
            });
            dispatch(load_user());
        } catch (err) {
            dispatch({
                type: GOOGLE_AUTH_FAIL
            });
        }
    }
};


export const DeleteProfile = () => async (dispatch) => {
    const csrfToken = Cookies.get('csrftoken');
    const accessToken = localStorage.getItem(ACCES_TOKEN);

    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        try {
            await api.delete('/api/accounts/delete-profile/', {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Authorization': `JWT ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            dispatch({ type: DELETE_PROFILE_SUCCESS });
            dispatch(logout());
        } catch (error) {
            dispatch({ 
                type: DELETE_PROFILE_FAIL,
                payload: error.response?.data || 'Failed to delete profile'
            });
        }
    }
};


export const checkAuthenticated = () => async dispatch => {
    if (localStorage.getItem('access')) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }; 

        const body = JSON.stringify({ token: localStorage.getItem('access') });

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/jwt/verify/`, body, config)

            if (res.data.code !== 'token_not_valid') {
                dispatch({
                    type: AUTHENTICATED_SUCCESS
                });
            } else {
                dispatch({
                    type: AUTHENTICATED_FAIL
                });
            }
        } catch (err) {
            dispatch({
                type: AUTHENTICATED_FAIL
            });
        }

    } else {
        dispatch({
            type: AUTHENTICATED_FAIL
        });
    }
};