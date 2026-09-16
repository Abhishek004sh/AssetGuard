const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const { createWorkspace,getMyWorkspace,addMember }=require("../controllers/workspace.controller");
const authorizeRoles = require("../middleware/role.middleware");


router.post(
"/member",
protect,
authorizeRoles("OWNER"),
addMember
);

router.post(
"/create",
protect,
authorizeRoles("OWNER"),
createWorkspace
);

router.get(
"/",
protect,
getMyWorkspace
);


module.exports = router;