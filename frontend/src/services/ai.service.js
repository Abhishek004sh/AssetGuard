import api from "./api";


export const askAssets = async(question)=>{

    const res =
    await api.post(
        "/ai/ask",
        { question }
    );

    return res.data;

};
