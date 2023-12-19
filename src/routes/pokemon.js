import { Router } from 'express';
import pokemonController from '../controllers/pokemon/pokemonController.js';
import habitatController from '../controllers/pokemon/habitatController.js';
import User from '../models/user.js';
const router = Router();

router.get('/', (req, res) => {
    res.send('Hello World!');
});

router.get('/fetch/random', async (req, res) => {
    try {
        const level = req.query.level || 5;
        const trainer = req.query.trainer || false;
        console.log("is trainer pokemon", trainer)
        const pokemon = await pokemonController.getNewRandomPokemon(level, trainer);
        const user = req.user;
        if (user.username) {
            const userDb = await User.findOne({ username: user.username });
            userDb.enemies.push(pokemon._id);
            console.log("enemies", userDb.enemies.length)
            await userDb.save();
        }
        res.send(pokemon);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:"error al buscar pokemon"});
    }
});
router.get('/fetch/:id', async (req, res) => {
    try {

        const id = req.params.id;
        const save = req.query.save;
        const trainer = req.query.trainer || false;
        console.log("is trainer pokemon", trainer)
        // if id is a number, it is the id of the generic pokemon, if it is a string, it is the _id of the pokemon in the database
        if (isNaN(id)) {
            const pokemon = await pokemonController.getPokemonByIdFromDb(id);
            res.send(pokemonController.getReducedPokemonData(pokemon));
            return;
        }

        const level = req.query.level || 5;
        const pokemon = await pokemonController.getNewPokemon(id, { level, save, trainer });
        res.send(pokemonController.getReducedPokemonData(pokemon));
    } catch (error) {
        res.status(404).json({error:"pokemon no encontrado"});
    }
});
router.get('/starter', async (req, res) => {
    try {
        const pokemon = await pokemonController.getStarterPokemons();
        res.send(pokemon);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:"error al buscar pokemon"});
    }
});

router.post('/attack', async (req, res) => {
    try {
        const pokemon1 = req.body.pokemon1;
        const pokemon2 = req.body.pokemon2;
        const result = await pokemonController.attack(pokemon1, pokemon2);
        res.send(result);
    } catch (error) {
        console.error(error)
        res.status(404).json({error:"pokemon no encontrado"});
    }
});

router.put('/level', async (req, res) => {
    try {
        const pokemon = req.body.pokemon;
        const result = await pokemonController.addLevel(pokemon);
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(404).json({error:"pokemon no encontrado"});
    }
});

router.delete('/saved/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log("deleting pokemon", id);
        const pokemon = await pokemonController.deletePokemon(id);
        res.send(pokemon);
    } catch (error) {
        console.error(error);
        res.status(404).json({error:"pokemon no encontrado"});
    }
});
router.get("/habitats", habitatController.getHabitats);
export default router;