const Workspace = require("../models/Workspace");
const User = require("../models/User");


const createWorkspace = async(req,res,next)=>{

    try{

        const {
            name
        } = req.body;


        const workspace =
        await Workspace.create({

            name,

            owner:req.user._id,

            members:[
                {
                    user:req.user._id,
                    role:"OWNER"
                }
            ]

        });


        res.status(201).json({

            message:"Workspace created successfully",

            workspace

        });


    }
    catch(error){

        next(error);

    }

};

const getMyWorkspace = async(req,res,next)=>{

    try{

        const workspace = await Workspace.findOne({
            owner:req.user._id
        })
        .populate(
            "members.user",
            "name email"
        );


        if(!workspace){

            return res.status(404).json({

                message:"No workspace found"

            });

        }


        res.status(200).json({

            workspace

        });


    }
    catch(error){

        next(error);

    }

};

const addMember = async(req,res,next)=>{

    try{

        const {
            email,
            role
        } = req.body;


        if(!email){

            return res.status(400).json({
                message:"Email is required"
            });

        }


        const userToAdd = await User.findOne({ email });


        if(!userToAdd){

            return res.status(404).json({
                message:"No user found with this email. They need to register first."
            });

        }


        const workspace =
        await Workspace.findOne({
            owner:req.user._id
        });


        if(!workspace){

            return res.status(404).json({
                message:"Workspace not found"
            });

        }


        const alreadyMember =
        workspace.members.find(
            member =>
            member.user.toString() === userToAdd._id.toString()
        );


        if(alreadyMember){

            return res.status(400).json({
                message:"User already exists in workspace"
            });

        }


        workspace.members.push({

            user:userToAdd._id,

            role:role || "MEMBER"

        });


        await workspace.save();

        await workspace.populate("members.user", "name email");


        res.status(200).json({

            message:"Member added successfully",

            workspace

        });


    }
    catch(error){

        next(error);

    }

};

module.exports = {
    createWorkspace,
    getMyWorkspace,
    addMember
};