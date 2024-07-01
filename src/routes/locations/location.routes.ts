import express, { Router, Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router: Router = express.Router();

router.get("/cities", async (req: Request, res: Response) => {
  const input = req.query.input;
  const apiKey = process.env.GOOGLE_API_KEY;
  const endpoint = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&types=(cities)&components=country:CM&key=${apiKey}`;

  try {
    const response = await axios.get(endpoint);
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching data from Google Places API" });
  }
});

export default router;
