import userController from "../controllers/userController.js";
import { Router } from "express";


const router = Router();


router.get("/pokemons", async(req, res) => {
    try {
        const username = req.user.username;
        const user = await userController.getUserPokemons(username);
        res.send(user);
    }
    catch (error) {
        console.error(error);
        res.status(404).json({error:"usuario no encontrado"});
    }
});

router.post("/pokemons", async(req, res) => {
    try {
        const username = req.user.username;
        const pokemon = req.body.pokemon;
        const user = await userController.addPokemonToUser(username, pokemon);
        res.send(user);
    }
    catch (error) {
        console.error(error);
        res.status(404).json({error:"usuario no encontrado"});
    }
});

router.put("/pokemons", async(req, res) => {
    try {
        const username = req.user.username;
        const pokemons = req.body;
        const data = await userController.setUserPokemons(username, pokemons);
        res.send(data);
    }
    catch (error) {
        console.error(error);
        res.status(404).json({error:"usuario no encontrado"});
    }
});

router.get("/pokemons/pc", async(req, res) => {
    try {
        const username = req.user.username;
        const user = await userController.getSavedPokemons(username);
        res.send(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:"usuario no encontrado"});
    }
});
router.post("/pokemons/pc", async(req, res) => {
    try {
        const username = req.user.username;
        const pokemon = req.body.pokemon;
        const user = await userController.savePokemonToPc(username, pokemon);
        res.send(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:"usuario no encontrado"});
    }
});
router.delete("/pokemons/pc/:id", async(req, res) => {
    try {
        const username = req.user.username;
        const id = req.params.id;
        const data = await userController.removePokemonFromPc(username, id);
        res.send(data);
    }
    catch (error) {
        console.error(error);
        res.status(404).json({error:"usuario no encontrado"});
    }
})
router.put("/pokemons/heal", async(req, res) => {
    try {
        const username = req.user.username;
        const data = await userController.healPokemons(username);
        res.send(data);
    }
    catch (error) {
        console.error(error);
        res.status(404).json({error:"usuario no encontrado"});
    }
});

router.put("/pokemons/swap", async(req, res) => {
    try {
        const username = req.user.username;
        const pokemon1 = req.body.id1;
        const pokemon2 = req.body.id2;
        const data = await userController.swapPokemons(username, pokemon1, pokemon2);
        res.send(data);
    }
    catch (error) {
        console.error(error);
        res.status(404).json({error:"usuario no encontrado"});
    }
});
router.delete("/pokemons/:id", async(req, res) => {
    try {
        const username = req.user.username;
        const id = req.params.id;
        const data = await userController.removePokemon(username, id);
        res.send(data);
    }
    catch (error) {
        console.error(error);
        res.status(404).json({error:"usuario no encontrado"});
    }
});
router.get("/data/:username", async(req, res) => {
    try {
        const username = req.params.username;
        const user = await userController.getUser(username);
        if (!user) {
            res.status(404).json({error:"usuario no encontrado"});
            return;
        }
        res.send(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:"Error interno"});
    }
}
);
router.post("/clear", (req, res) => {
    try {
        const username = req.user.username;
        userController.clearFight(username);
        res.json({message:"ok"});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:"Error interno"});
    }
});
router.put("/maxlevel", (req, res) => {
    try {
        const username = req.user.username;
        const maxLevel = req.body.maxLevel;
        userController.setMaxLevel(username, maxLevel);
        res.json({message:"ok"});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:"Error interno"});
    }
});

router.put("/zone", (req, res) => {
    try {
        const username = req.user.username;
        const zone = req.body.zone;
        userController.setZone(username, zone);
        res.json({message:"ok"});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:"Error interno"});
    }
});

router.put("/reset", (req, res) => {
    try {
        const username = req.user.username;
        userController.resetUser(username);
        res.json({message:"ok"});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:"Error interno"});
    }
});


export default router;
