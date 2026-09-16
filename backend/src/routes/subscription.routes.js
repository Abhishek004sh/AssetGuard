const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const { subscriptionSchema } = require("../validations/subscription.validation");
const { 
    
createSubscription,
getSubscriptions,
getSubscriptionStats,
updateSubscription,
deleteSubscription 

}=require("../controllers/subscription.controller");


router.get(
"/stats",
protect,
getSubscriptionStats
);

router.post(
"/",
protect,
validate(subscriptionSchema),
createSubscription
);

router.get(
"/",
protect,
getSubscriptions
);

router.put(
"/:id",
protect,
updateSubscription
);

router.delete(
"/:id",
protect,
authorizeRoles("OWNER"),
deleteSubscription
);


module.exports = router;