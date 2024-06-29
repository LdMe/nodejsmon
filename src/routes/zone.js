import { Router } from "express";

import zoneController from "../controllers/pokemon/zoneController.js";

const router = Router();


router.get("/", async (req, res) => {
    const zones = await zoneController.getZones();

    res.json(zones);
});

router.get("/:name", async (req, res) => {
    const name = req.params.name;
    const zone = await zoneController.getZone(name);
    res.json(zone);
});
export default router;
