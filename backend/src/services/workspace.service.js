const Workspace = require("../models/Workspace");


const getUserWorkspace = async(userId)=>{


    const workspace =
    await Workspace.findOne({
        $or:[
            {
                owner:userId
            },
            {
                "members.user":userId
            }
        ]
    });


    return workspace;

};


module.exports = getUserWorkspace;