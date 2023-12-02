import {Router } from 'express';
import pokemonController from '../controllers/pokemonController.js';
const router = Router();

router.get('/', (req, res) => {
    res.send('Hello World!');
});

router.get('/fetch/random', async(req, res) => {
    const level = req.query.level || 5;
    const pokemon = await pokemonController.getNewRandomPokemon(level);
    res.send(pokemon);
});
router.get('/fetch/:id', async(req, res) => {
    try {
        
        const id = req.params.id;
        const level = req.query.level || 5;
        const pokemon = await pokemonController.getNewPokemon(id,level);
        res.send(pokemon);
    } catch (error) {
        res.status(404).send("pokemon no encontrado");
    }
});
router.get('/starter', async(req, res) => {
    const pokemon = await pokemonController.getStarterPokemons();
    res.send(pokemon);
});

router.post('/attack', async(req, res) => {
    try {
        const pokemon1 = req.body.pokemon1;
        const pokemon2 = req.body.pokemon2;
        const move = req.body.move;
        const result = await pokemonController.attack(pokemon1,pokemon2,move,true);
        res.send(result);
    } catch (error) {
        console.error(error)
        res.status(404).send("pokemon no encontrado");
    }
});

router.put('/level', async(req, res) => {
    try {
        const pokemon = req.body.pokemon;
        const result = await pokemonController.addLevel(pokemon);
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(404).send("pokemon no encontrado");
    }
});


export default router;