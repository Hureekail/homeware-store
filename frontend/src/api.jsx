import axios from "axios"
import Cookies from 'js-cookie'
import { ACCES_TOKEN } from "./constants"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})
// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCES_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        const csrfToken = Cookies.get('csrftoken');
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default api 