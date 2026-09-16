const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.get(
    "/owner",
    protect,
    authorizeRoles("OWNER"),
    (req,res)=>{


    res.json({

    message:"Owner access granted",

    user:req.user

    });
});


module.exports = router;