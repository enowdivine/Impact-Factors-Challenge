import { Request, Response } from "express";
import Church from "../church/church.model";

class SubdomainController {
  async checkSubdomain(req: Request, res: Response) {
    try {
      const { churchName } = req.params;
      const subdomain = `${churchName
        .toLowerCase()
        .replace(/\s+/g, "-")}.localhost`;

      const existingChurch = await Church.findOne({ subdomain });
      if (existingChurch) {
        return res.status(409).json({ message: "Subdomain already taken" });
      }

      return res
        .status(200)
        .json({ message: "Subdomain available", subdomain });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Subdomain check failed", error: error.message });
    }
  }
}

export default SubdomainController;
