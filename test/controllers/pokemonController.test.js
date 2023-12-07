/*
Test para el controlador de pokemones
con jest
*/

import connection from "../../src/config/db.js";
import Pokemon from "../../src/models/pokemon.js";
import pokemonController from "../../src/controllers/pokemon/pokemonController.js";
import dotenv from "dotenv";


dotenv.config();

describe("tests pokemonController", () => {
    let pokemon = null;
    const moves = [
        { move: { name: "move1" }, version_group_details: [{ level_learned_at: 1 ,move_learn_method:{name:'level-up'}}] },
        { move: { name: "move2" }, version_group_details: [{ level_learned_at: 2 ,move_learn_method:{name:'level-up'}}] },
        { move: { name: "move3" }, version_group_details: [{ level_learned_at: 3 ,move_learn_method:{name:'level-up'}}] },
        { move: { name: "move4" }, version_group_details: [{ level_learned_at: 4 ,move_learn_method:{name:'trade'}}] },
        { move: { name: "move5" }, version_group_details: [{ level_learned_at: 5 ,move_learn_method:{name:'level-up'}}] },
        { move: { name: "move6" }, version_group_details: [{ level_learned_at: 6 ,move_learn_method:{name:'level-up'}}] },
        { move: { name: "move7" }, version_group_details: [{ level_learned_at: 7 ,move_learn_method:{name:'level-up'}}] },
        { move: { name: "move8" }, version_group_details: [{ level_learned_at: 8 ,move_learn_method:{name:'level-up'}}] },

    ];
    beforeAll(async() => {
        await connection.promise;
    });
    test("should filter moves by level", () => {
        
        const level = 5;
        const result = pokemonController.filterMovesByLevel(moves, level);
        expect(result.length).toBe(4);
        expect(result[0].move.name).toBe("move1");
        expect(result[1].move.name).toBe("move2");
        expect(result[2].move.name).toBe("move3");
        expect(result[3].move.name).toBe("move5");
    });

    test("should get n moves from array", () => {
        const n = 4;
        const result = pokemonController.getNRandomUniqueMoves(moves, n);
        expect(result.length).toBe(n);
        expect(result[0].move.name).toBeDefined();
        expect(result[1].move.name).toBeDefined();
        expect(result[2].move.name).toBeDefined();
        expect(result[3].move.name).toBeDefined();
    });

    test("should get pokemon with id 1", async() => {
        const level = 10;
        pokemon = await pokemonController.getNewPokemon(1,{level});
        expect(pokemon.id).toBe(1);
        expect(pokemon.name).toBe("bulbasaur");
        expect(pokemon.level).toBe(level);
        pokemon = await pokemonController.getNewPokemon(234234234,{level});
        expect(pokemon).toBeNull();
    });
    test("should get a random pokemon", async() => {
        const level = 10;
        pokemon = await pokemonController.getNewRandomPokemon(level);
        expect(pokemon.id).toBeGreaterThan(0);
        expect(pokemon.name).toBeDefined();
        expect(pokemon.level).toBe(level);
    });
    test("should check if pokemon is evolving", async() => {
        const level = 16;
        pokemon = await pokemonController.getNewPokemon(1,{level});
        const isEvolving = pokemonController.isEvolving(pokemon);
        expect(isEvolving).toBe(true);
        pokemon.level = 5;
        const isEvolving2 = pokemonController.isEvolving(pokemon);
        expect(isEvolving2).toBe(false);
    });
    test("should evolve pokemon", async() => {
        const level = 16;
        pokemon = await pokemonController.getNewPokemon(1,{level});
        const evolvedPokemon = await pokemonController.evolve(pokemon);
        expect(evolvedPokemon.id).toBe(2);
        expect(evolvedPokemon.name).toBe("ivysaur");
        expect(evolvedPokemon.level).toBe(level);
        pokemon.level = 5;
        const evolvedPokemon2 = await pokemonController.evolve(pokemon);
        expect(evolvedPokemon2.id).toBe(1);
    });
    test("should get pokemons from array of ids", async() => {
        const level = 10;
        const pokemons = await pokemonController.getPokemons([1, 4, 7],level);
        expect(pokemons.length).toBe(3);
        expect(pokemons[0].id).toBe(1);
        expect(pokemons[0].name).toBe("bulbasaur");
        expect(pokemons[0].level).toBe(level);
        expect(pokemons[1].id).toBe(4);
        expect(pokemons[1].name).toBe("charmander");
        expect(pokemons[1].level).toBe(level);
        expect(pokemons[2].id).toBe(7);
        expect(pokemons[2].name).toBe("squirtle");
        expect(pokemons[2].level).toBe(level);
    });
    test("should add level to pokemon", async() => {
        const level = 10;
        const pokemon = await pokemonController.getNewPokemon(1,{level});
        const pokemonWithLevel = await pokemonController.addLevel(pokemon);
        expect(pokemonWithLevel.level).toBe(level + 1);
    });

    test("should get starter pokemons", async() => {
        const pokemons = await pokemonController.getStarterPokemons();
        expect(pokemons.length).toBe(3);
        expect(pokemons[0].id).toBe(1);
        expect(pokemons[0].name).toBe("bulbasaur");
        expect(pokemons[0].level).toBe(5);
        expect(pokemons[1].id).toBe(4);
        expect(pokemons[1].name).toBe("charmander");
        expect(pokemons[1].level).toBe(5);
        expect(pokemons[2].id).toBe(7);
        expect(pokemons[2].name).toBe("squirtle");
        expect(pokemons[2].level).toBe(5);
    });

    
});
