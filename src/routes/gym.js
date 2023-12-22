import gymController from "../controllers/gymController.js";
import { Router } from "express";

const router = Router();

router.get("/", async(req, res) => {
    try {
        const gyms = await gymController.getAllGyms();
        res.json(gyms);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:"error al obtener gimnasios"});
    }
});

router.get("/:id", async(req, res) => {
    try {
        const gym = await gymController.getGym(req.params.id);
        res.json(gym);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:"error al obtener gimnasio"});
    }
});

router.post("/", async(req, res) => {
    try {
        const gym = await gymController.createGym(req.body);
        res.json(gym);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:"error al crear gimnasio"});
    }
});

router.put("/:id", async(req, res) => {
    try {
        const gym = await gymController.updateGym(req.params.id, req.body);
        res.json(gym);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:"error al actualizar gimnasio"});
    }
});

router.delete("/:id", async(req, res) => {
    try {
        const gym = await gymController.deleteGym(req.params.id);
        res.json(gym);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:"error al eliminar gimnasio"});
    }
});

export default router;