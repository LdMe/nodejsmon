import userController from "../../src/controllers/userController.js";
import pokemonController from "../../src/controllers/pokemonController.js";
import connection from "../../src/config/db.js";

describe("tests userController", () => {
    beforeAll(async() => {
        await connection.promise;
    });
    test("should add a pokemon to user", async() => {
        const pokemon = await pokemonController.getNewRandomPokemon(5);
        const user = await userController.addPokemonToUser("admin", pokemon);
        expect(user.username).toBe("admin");
        expect(user.pokemons[user.pokemons.length-1].name).toBe(pokemon.name);
    });
    test("should get user pokemons", async() => {
        const pokemons = await userController.getUserPokemons("admin");
        expect(pokemons[0].name).toBeDefined();
        expect(pokemons[0].level).toBeDefined();
        expect(pokemons[0].moves).toBeDefined();
    });

});
        