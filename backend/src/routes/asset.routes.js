const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const { 
    
createAsset,
getAssets,
updateAsset,
deleteAsset,
getWarrantyStatus,
uploadInvoice 

}=require("../controllers/asset.controller");

const authorizeRoles = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const { assetSchema } = require("../validations/asset.validation");


router.post(
"/",
protect,
validate(assetSchema),
createAsset
);

router.get(
"/",
protect,
getAssets
);

router.put(
"/:id",
protect,
updateAsset
);

router.delete(
"/:id",
protect,
authorizeRoles("OWNER"),
deleteAsset
);

router.get(
"/warranty-status",
protect,
getWarrantyStatus
);

//Invoice Route
router.post(
    "/:id/invoice",
    protect,
    upload.single("invoice"),
    uploadInvoice
);

module.exports = router;