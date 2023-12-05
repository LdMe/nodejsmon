import User from "../models/user.js";
import Pokemon from "../models/pokemon.js";

const addPokemonToUser = async (username, pokemon) => {
    const user = await User.findOne({ username });
    if (user.pokemons.length >= 6) {
        throw new Error("No puedes tener más de 6 pokemons");
    }
    const newPokemon = new Pokemon(pokemon);
    await newPokemon.save();
    user.pokemons.push(newPokemon);
    await user.save();
    /* populate the pokemons array */
    await user.populate("pokemons")

    return {
        username: user.username,
        pokemons: user.pokemons,
    }
}

const fixStatMultiplier = (stats) => {
    for (const stat of stats) {
        stat.multiplier = 1;
    }
    return stats;
}
const getUserPokemons = async (username) => {
    const user = await User.findOne({ username }).populate("pokemons");
    for (const pokemon of user.pokemons) {
        pokemon.stats = fixStatMultiplier(pokemon.stats);
        pokemon.save();
    }
    return user.pokemons;
}
/*
cambiamos los pokemons del usuario por los que se introducen, si no existen los creamos, si existen los actualizamos, tanto de contenido como de orden
*/
const setUserPokemons = async (username, pokemons) => {
    const user = await User.findOne({ username }).populate("pokemons");
    const newPokemons = await Promise.all(pokemons.map(async (pokemon) => {
        if (pokemon._id) {
            const oldPokemon = await Pokemon.findById(pokemon._id);
            oldPokemon.name = pokemon.name;
            oldPokemon.level = pokemon.level;
            oldPokemon.moves = pokemon.moves;
            await oldPokemon.save();
            return oldPokemon;
        }
        else {
            const newPokemon = new Pokemon(pokemon);
            await newPokemon.save();
            return newPokemon;
        }
    }));
    user.pokemons = newPokemons;
    await user.save();
    return {
        username: user.username,
        pokemons: newPokemons,
    }
}

const healPokemons = async (username) => {
    const user  = await User.findOne({ username }).populate("pokemons");
    const pokemons = user.pokemons;
    const healedPokemons = await Promise.all(pokemons.map(async (pokemon) => {
        pokemon.hp = pokemon.maxHp;
        await pokemon.save();
        return pokemon;
    }));
    user.pokemons = healedPokemons;
    await user.save();
    return {
        username: user.username,
        pokemons: healedPokemons,
    }
}

const swapPokemons = async (username, id1, id2) => {
    const user = await User.findOne({ username }).populate("pokemons");
    const pokemons = user.pokemons;
    const index1 = pokemons.findIndex((pokemon) => { return pokemon._id.toString() === id1 });
    const index2 = pokemons.findIndex((pokemon) => { return pokemon._id.toString() === id2 });
    if (index1 === -1 || index2 === -1) {
        throw new Error("No se han encontrado los pokemons");
    }
    const aux = pokemons[index1];
    pokemons[index1] = pokemons[index2];
    pokemons[index2] = aux;
    user.pokemons = pokemons;
    await user.save();
    return {
        username: user.username,
        pokemons: pokemons,
    }
}

const removePokemon = async (username, id) => {
    const user = await User.findOne({ username }).populate("pokemons");
    const pokemons = user.pokemons;
    const index = pokemons.findIndex((pokemon) => { return pokemon._id.toString() === id });
    if (index === -1) {
        throw new Error("No se ha encontrado el pokemon");
    }
    const pokemon = pokemons[index];
    await Pokemon.findByIdAndDelete(pokemon._id);
    pokemons.splice(index, 1);
    user.pokemons = pokemons;
    await user.save();
    return {
        username: user.username,
        pokemons: pokemons,
    }
}

const getUser   = async (username) => {
    const user = await User.findOne({ username }).populate("pokemons");
    if (!user) {
        return null;
    }
    const userData = {
        username: user.username,
        pokemons: user.pokemons,
    }
    return userData;
}

export default {
    addPokemonToUser,
    getUserPokemons,
    setUserPokemons,
    healPokemons,
    swapPokemons,
    removePokemon,
    getUser,
}