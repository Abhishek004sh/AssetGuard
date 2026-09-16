import axios from "axios";


const api = axios.create({

    baseURL:"http://localhost:5000/api"

});



api.interceptors.request.use(

    (config)=>{


        const token =
        localStorage.getItem("token");


        if(token){

            config.headers.Authorization =
            `Bearer ${token}`;

        }


        return config;

    },

    (error)=>{

        return Promise.reject(error);

    }

);


// If the token is invalid/expired, the backend returns 401.
// Clear it and send the user back to login instead of leaving
// the app stuck showing stale/broken data.
api.interceptors.response.use(

    (response) => response,

    (error) => {

        if(error.response?.status === 401){

            localStorage.removeItem("token");

            if(window.location.pathname !== "/login"){

                window.location.href = "/login";

            }

        }

        return Promise.reject(error);

    }

);


export default api;