import {
    useEffect,
    useState
} from "react";

import Layout from "../components/Layout";

import { getMyWorkspace, addMember } from "../services/workspace.service";


function Workspace(){

    const [workspace,setWorkspace] = useState(null);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState("");

    const [memberForm,setMemberForm] = useState({
        email:"",
        role:"MEMBER"
    });

    const [memberMessage,setMemberMessage] = useState("");


    const loadWorkspace = async () => {

        try{

            const data = await getMyWorkspace();

            setWorkspace(data.workspace);

        }
        catch(err){

            setError(
                err.response?.data?.message ||
                "Could not load workspace"
            );

        }
        finally{

            setLoading(false);

        }

    };


    useEffect(()=>{

        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadWorkspace();

    },[]);


    const handleMemberChange = (e) => {

        setMemberForm({

            ...memberForm,

            [e.target.name]: e.target.value

        });

    };


    const handleAddMember = async (e) => {

        e.preventDefault();

        setMemberMessage("");

        try{

            await addMember(memberForm.email, memberForm.role);

            setMemberMessage("Member added successfully");

            setMemberForm({ email:"", role:"MEMBER" });

            loadWorkspace();

        }
        catch(err){

            setMemberMessage(
                err.response?.data?.message ||
                "Could not add member"
            );

        }

    };


    if(loading){

        return (
            <Layout>
                <p className="text-gray-500">Loading...</p>
            </Layout>
        );

    }


    if(error){

        return (
            <Layout>
                <div className="bg-white p-5 rounded-xl shadow text-red-500">
                    {error}
                </div>
            </Layout>
        );

    }


    return (

        <Layout>

            <h1 className="text-3xl font-bold mb-6">
                Workspace
            </h1>

            <div className="bg-white p-5 rounded-xl shadow mb-6">

                <h2 className="text-xl font-bold mb-2">
                    {workspace?.name}
                </h2>

                <h3 className="font-semibold mt-4 mb-2">
                    Members
                </h3>

                <div className="grid gap-2">

                    {workspace?.members?.map((member) => (

                        <div
                        key={member.user?._id || member._id}
                        className="flex justify-between border-b py-2"
                        >

                            <span>
                                {member.user?.name} ({member.user?.email})
                            </span>

                            <span className="text-sm text-gray-500">
                                {member.role}
                            </span>

                        </div>

                    ))}

                </div>

            </div>

            <div className="bg-white p-5 rounded-xl shadow">

                <h3 className="font-semibold mb-3">
                    Add a Member
                </h3>

                <p className="text-sm text-gray-500 mb-3">
                    Enter the registered email of the person you want to add
                    to this workspace. They must already have an account.
                </p>

                {memberMessage && (
                    <p className="text-sm mb-3 text-blue-600">
                        {memberMessage}
                    </p>
                )}

                <form onSubmit={handleAddMember} className="flex gap-2 flex-wrap">

                    <input
                    name="email"
                    type="email"
                    placeholder="Member's email"
                    value={memberForm.email}
                    onChange={handleMemberChange}
                    className="border p-2 rounded flex-1 min-w-[200px]"
                    required
                    />

                    <select
                    name="role"
                    value={memberForm.role}
                    onChange={handleMemberChange}
                    className="border p-2 rounded"
                    >
                        <option value="MEMBER">Member</option>
                        <option value="VIEWER">Viewer</option>
                    </select>

                    <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded"
                    >
                        Add
                    </button>

                </form>

            </div>

        </Layout>

    );

}


export default Workspace;
