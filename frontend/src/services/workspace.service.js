import api from "./api";


export const getMyWorkspace = async()=>{

    const res =
    await api.get("/workspace");


    return res.data;

};

export const addMember = async(email, role)=>{

    const res =
    await api.post(
        "/workspace/member",
        { email, role }
    );

    return res.data;

};
