import {
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    USER_LOADED_SUCCESS,
    USER_LOADED_FAIL,
    AUTHENTICATED_SUCCESS,
    AUTHENTICATED_FAIL,
    PASSWORD_RESET_SUCCESS,
    PASSWORD_RESET_FAIL,
    PASSWORD_RESET_CONFIRM_SUCCESS,
    PASSWORD_RESET_CONFIRM_FAIL,
    SIGNUP_SUCCESS,
    SIGNUP_FAIL,
    ACTIVATION_SUCCESS,
    ACTIVATION_FAIL,
    GOOGLE_AUTH_SUCCESS,
    GOOGLE_AUTH_FAIL,
    FACEBOOK_AUTH_SUCCESS,
    FACEBOOK_AUTH_FAIL,
    LOGOUT,
    SET_ALERT,
    REMOVE_ALERT,
    
    CHANGE_EMAIL_START,
    VERIFY_NEW_EMAIL_SUCCESS,
    VERIFY_NEW_EMAIL_FAIL,
    CHANGE_EMAIL_START_FAIL,
    CONTACT_SUCCESS,
    CONTACT_FAIL,
} from '../components/types';

const initialState = {
    access: localStorage.getItem('access'),
    refresh: localStorage.getItem('refresh'),
    isAuthenticated: null,
    user: null,
    passwordResetSuccess: false,
    passwordResetConfirmSuccess: false,
    error: null,
    alert: null,
    loading: false
};

export default function authReducer(state = initialState, action) {
    const { type, payload } = action;

    switch(type) {
        case AUTHENTICATED_SUCCESS:
            return {
                ...state,
                isAuthenticated: true
            }
        case LOGIN_SUCCESS:
        case GOOGLE_AUTH_SUCCESS:
            localStorage.setItem('access', payload.access)
            localStorage.setItem('refresh', payload.refresh)
            return {
                ...state,
                isAuthenticated: true,
                access: payload.access,
                refresh: payload.refresh,
                alert: { message: 'Login successful!', type: 'success' }
            }
        case FACEBOOK_AUTH_SUCCESS:
            localStorage.setItem('access', payload.access);
            localStorage.setItem('refresh', payload.refresh);
            return {
                ...state,
                isAuthenticated: true,
                access: payload.access,
                refresh: payload.refresh,
                alert: { message: 'Facebook login successful!', type: 'success' }
            }
        case SIGNUP_SUCCESS:
            return {
                ...state,
                isAuthenticated: false,
                alert: { message: 'Registration successful! Please check your email to activate your account.', type: 'success' }
            }
        case USER_LOADED_SUCCESS:
            return {
                ...state,
                user: payload
            }
        case AUTHENTICATED_FAIL:
            return {
                ...state,
                isAuthenticated: false
            }
        case USER_LOADED_FAIL:
            return {
                ...state,
                user: null
            }
        case GOOGLE_AUTH_FAIL:
        case FACEBOOK_AUTH_FAIL:
        case LOGIN_FAIL:
        case SIGNUP_FAIL:
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            return {
                ...state,
                access: null,
                refresh: null,
                isAuthenticated: false,
                user: null,
                alert: { message: payload?.detail || 'Authentication failed. Please try again.', type: 'danger' }
            }
        case LOGOUT:
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            return {
                ...state,
                access: null,
                refresh: null,
                isAuthenticated: false,
                user: null,
                alert: { message: 'Logged out successfully', type: 'success' }
            }
        case PASSWORD_RESET_SUCCESS:
            return {
                ...state,
                passwordResetSuccess: true,
                error: null,
                alert: { message: 'Password reset email sent!', type: 'success' }
            }
        case PASSWORD_RESET_FAIL:
            return {
                ...state,
                passwordResetSuccess: false,
                error: payload || 'Password reset error',
                alert: { message: 'Password reset failed. Please try again.', type: 'danger' }
            }
        case PASSWORD_RESET_CONFIRM_SUCCESS:
            return {
                ...state,
                passwordResetConfirmSuccess: true,
                error: null,
                alert: { message: 'Password reset successful!', type: 'success' }
            }
        case PASSWORD_RESET_CONFIRM_FAIL:
            return {
                ...state,
                passwordResetConfirmSuccess: false,
                error: payload || 'Password reset confirmation error',
                alert: { message: 'Password reset failed. Please try again.', type: 'danger' }
            }
        case ACTIVATION_SUCCESS:
            return {
                ...state,
                alert: { message: 'Account activated successfully!', type: 'success' }
            }
        case ACTIVATION_FAIL:
            return {
                ...state,
                alert: { message: 'Activation failed. Please try again.', type: 'danger' }
            }
        case SET_ALERT:
            return {
                ...state,
                alert: payload
            }
        case REMOVE_ALERT:
            return {
                ...state,
                alert: null
            }
        case CHANGE_EMAIL_START:
            return {
                ...state,
                alert: { message: 'Confirm your new email!', type:'info' }
            }
        case CHANGE_EMAIL_START_FAIL:
            return {
                ...state,
                alert: { message: payload?.detail || 'Something went wrong. Please try again later.', type:'danger'}
            }
        case VERIFY_NEW_EMAIL_SUCCESS:
            return {
                ...state,
                alert: { message: 'Your email address has been updated successfully!', type:'success' }
            }
        case VERIFY_NEW_EMAIL_FAIL:
            return {
                ...state,
                alert: { message: payload?.detail ||  'Something went wrong. Please try again later.', type:'danger' }
            }
        case CONTACT_SUCCESS:
            return {
                ...state,
                alert: { message: 'Message sent successfully!', type:'success' }
            }
        case CONTACT_FAIL:
            return {
                ...state,
                alert: { message: payload?.detail || 'Something went wrong. Please try again later.', type:'danger' }
            }
        case 'LOADING_START':
            return {
                ...state,
                loading: true
            }
        case 'LOADING_END':
            return {
                ...state,
                loading: false
            }
        default:
            return state
        
    }
};