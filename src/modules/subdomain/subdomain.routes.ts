import express from "express";
import SubdomainController from "./subdomain.controller";

const router = express.Router();
const subdomainController = new SubdomainController();

router.get("/check/:churchName", subdomainController.checkSubdomain);

export default router;
