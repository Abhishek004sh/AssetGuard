const Asset = require("../models/Asset");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const getUserWorkspace = require("../services/workspace.service");

const createAsset = async(req,res,next)=>{

    try{

        const {
            name,
            category,
            description,
            purchaseDate,
            purchasePrice,
            warrantyExpiry,
            serialNumber,
            invoiceUrl
        } = req.body;


        // Find user's workspace

        const workspace = await getUserWorkspace(req.user._id);


        if(!workspace){

            return res.status(404).json({

                message:"Workspace not found"

            });

        }


        const asset = await Asset.create({

            name,

            category,

            description,

            purchaseDate,

            purchasePrice,

            warrantyExpiry,

            serialNumber,

            invoiceUrl,

            workspace:workspace._id,

            addedBy:req.user._id

        });


        res.status(201).json({

            message:"Asset created successfully",

            asset

        });


    }
    catch(error){

        next(error);

    }

};


const getAssets = async(req,res,next)=>{

    try{
        const {
            page = 1,
            limit = 10,
            search = "",
            sort = "createdAt"
        } = req.query;


        const workspace = await getUserWorkspace(req.user._id);

        if(!workspace){

        return res.status(404).json({
            message:"Workspace not found"
        });
        
        }
        const query = {
            workspace:workspace._id
        };


        if(search){

            query.name = {
                $regex: search,
                $options:"i"
            };

        }


        const assets =
        await Asset.find(query)
        .sort({
            [sort]:-1
        })
        .limit(limit * 1)
        .skip(
            (page - 1) * limit
        );


        const total =
        await Asset.countDocuments(query);


        res.status(200).json({

            assets,

            pagination:{
                total,
                page:Number(page),
                pages:Math.ceil(total/limit)
            }

        });


    }
    catch(error){

        next(error);

    }

};

const updateAsset = async(req,res,next)=>{

    try{

        const {
            id
        } = req.params;


        const asset = await Asset.findById(id);


        if(!asset){

            return res.status(404).json({

                message:"Asset not found"

            });

        }


        const workspace = await getUserWorkspace(req.user._id);


        if(!workspace){

            return res.status(404).json({

                message:"Workspace not found"

            });

        }


        // Check asset belongs to user's workspace

        if(
            asset.workspace.toString() !== 
            workspace._id.toString()
        ){

            return res.status(403).json({

                message:"You cannot update this asset"

            });

        }


        const updatedAsset =
        await Asset.findByIdAndUpdate(

            id,

            req.body,

            {
                new:true
            }

        );


        res.status(200).json({

            message:"Asset updated successfully",

            asset:updatedAsset

        });


    }
    catch(error){

        next(error);

    }

};

const deleteAsset = async(req,res,next)=>{

    try{

        const {
            id
        } = req.params;


        const asset = await Asset.findById(id);


        if(!asset){

            return res.status(404).json({

                message:"Asset not found"

            });

        }


        const workspace = await getUserWorkspace(req.user._id);


        if(!workspace){

            return res.status(404).json({

                message:"Workspace not found"

            });

        }


        // Check ownership of workspace

        if(
            asset.workspace.toString() !== 
            workspace._id.toString()
        ){

            return res.status(403).json({

                message:"You cannot delete this asset"

            });

        }


        await Asset.findByIdAndDelete(id);


        res.status(200).json({

            message:"Asset deleted successfully"

        });


    }
    catch(error){

        next(error);

    }

};

const getWarrantyStatus = async(req,res,next)=>{

    try{

        const workspace = await getUserWorkspace(req.user._id);


        if(!workspace){

            return res.status(404).json({

                message:"Workspace not found"

            });

        }


        const assets = await Asset.find({

            workspace: workspace._id

        });


        let active = 0;
        let expiringSoon = 0;
        let expired = 0;


        const today = new Date();


        assets.forEach(asset=>{


            const expiry =
            new Date(asset.warrantyExpiry);


            const diff =
            Math.ceil(
                (expiry - today)
                /
                (1000*60*60*24)
            );


            if(diff < 0){

                expired++;

            }
            else if(diff <= 30){

                expiringSoon++;

            }
            else{

                active++;

            }


        });


        res.status(200).json({

            totalAssets:assets.length,

            active,

            expiringSoon,

            expired

        });


    }
    catch(error){

        next(error);

    }

};

const uploadInvoice = async (req, res,next) => {
    try {

        const { id } = req.params;

        const asset = await Asset.findById(id);

        if (!asset) {
            return res.status(404).json({
                message: "Asset not found"
            });
        }

        const workspace = await getUserWorkspace(req.user._id);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found"
            });
        }

        if (
            asset.workspace.toString() !==
            workspace._id.toString()
        ) {
            return res.status(403).json({
                message: "You cannot upload invoice for this asset"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a file"
            });
        }

        const result = await uploadToCloudinary(req.file.buffer);

        asset.invoiceUrl = result.secure_url;

        await asset.save();

        res.status(200).json({
            message: "Invoice uploaded successfully",
            invoiceUrl: asset.invoiceUrl
        });

    } catch (error) {

        next(error);

    }
};

module.exports = {
    createAsset,
    getAssets,
    updateAsset,
    deleteAsset,
    getWarrantyStatus,
    uploadInvoice
};