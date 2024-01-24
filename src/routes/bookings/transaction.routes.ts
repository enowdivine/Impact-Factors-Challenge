import express, { Router } from "express";
import Transaction from "./transaction.controller";

const router: Router = express.Router();
const transaction = new Transaction();

router.post("/create", transaction.create);

router.get("/transaction/:id", transaction.transaction);
router.get("/transactions/:vendorId", transaction.vendorTransaction);
router.get("/transactions", transaction.transactions);
router.get("/wallet-top-up", transaction.topUpWallet);

export default router;
