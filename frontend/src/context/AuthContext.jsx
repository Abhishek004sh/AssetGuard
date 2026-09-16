import {
    createContext,
    useState,
    useEffect
} from "react";

import api from "../services/api";


export const AuthContext =
createContext();


export const AuthProvider = ({children})=>{


    const [user,setUser] = useState(null);


    const [token,setToken] = useState(
        localStorage.getItem("token")
    );


    const [authLoading,setAuthLoading] = useState(true);


    useEffect(()=>{

        const loadUser = async()=>{

            if(!token){

                setAuthLoading(false);

                return;

            }

            try{

                const res = await api.get("/auth/me");

                setUser(res.data.user);

            }
            catch{

                // Token invalid/expired - log the user out
                localStorage.removeItem("token");

                setToken(null);

                setUser(null);

            }
            finally{

                setAuthLoading(false);

            }

        };

        loadUser();

        // Only run this on mount / when token changes from null -> value
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);


    return (

        <AuthContext.Provider
        value={{
            user,
            setUser,
            token,
            setToken,
            authLoading
        }}
        >

            {children}

        </AuthContext.Provider>

    );


};
