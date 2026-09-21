import { Router } from "express";

import {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    getMyTransactions
} from "../controllers/transaction.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";

import {
    verifyPropertyAccess,
    verifyTenantAccess,
    verifyTenantPropertyAccess
} from "../middlewares/ownership.middleware.js";


const router = Router({
    mergeParams: true
});
router.use(verifyJWT);

router.route("/")
      .post(verifyRole(["OWNER","CARETAKER"]),verifyPropertyAccess,createTransaction)
      .get(verifyRole(["OWNER","CARETAKER"]),verifyPropertyAccess,getTransactions)

router.route("/my-transactions")
    .get(verifyRole(["TENANT"]),verifyTenantPropertyAccess,getMyTransactions)

router.route("/:transactionId")
    .get(verifyRole(["OWNER","CARETAKER","TENANT"]),verifyTenantAccess,getTransactionById)
    .put(verifyRole(["OWNER","CARETAKER"]),verifyPropertyAccess,updateTransaction)


export default router;