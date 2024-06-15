import User from "../models/user.js";
import Pokemon from "../models/pokemon.js";
import pokemonController, { getNewPokemon, getReducedPokemonData } from "./pokemon/pokemonController.js";
const addPokemonToUser = async (username, pokemonId) => {

    const user = await User.findOne({ username }).populate("pokemons");

    if (user.pokemons.length >= 6) {
        throw new Error("No puedes tener más de 6 pokemons");
    }
    if (user.pokemons.find((pokemon) => { return pokemon._id.toString() === pokemonId.toString() })) {
        throw new Error("Ya tienes este pokemon");
    }
    let pokemon = null;
    try {
        // if pokemonId is a valid id, we search for it in the db
        if (pokemonId.length === 24) {
            pokemon = await Pokemon.findById(pokemonId);
        }
        // if pokemonId is a valid name, we search for it in the db
        else {
            pokemon = await getNewPokemon(pokemonId, { level: 5 });
        }

    } catch (error) {

        throw new Error("No se ha encontrado el pokemon");
    }
    if (!pokemon._id) {
        pokemon = new Pokemon(pokemon);
    }
    pokemon.owner = user._id;
    await pokemon.save();
    user.pokemons.push(pokemon);
    const pokemonsSet = new Set(user.pokemons);
    user.pokemons = [...pokemonsSet];
    await user.save();
    await user.populate("pokemons")

    return {
        username: user.username,
        pokemons: user.pokemons,
    }
}
const savePokemonToPc = async (username, pokemonId) => {
    try {
        const user = await User.findOne({ username }).populate("pokemons");
        await user.populate("savedPokemons");
        const pokemon = user.pokemons.find((pokemon) => { return pokemon._id.toString() === pokemonId });
        if (!pokemon) {
            throw new Error("No se ha encontrado el pokemon");
        }
        if (user.savedPokemons.length >= 30) {
            throw new Error("No puedes guardar más de 30 pokemons");
        }
        if(user.pokemons.length === 1){
            throw new Error("No puedes guardar el último pokemon");
        }
        user.savedPokemons.push(pokemon);
        user.pokemons = user.pokemons.filter((pokemon) => { return pokemon._id.toString() !== pokemonId });
        await user.save();
        /* const pokemons = user.pokemons.map((pokemon) => pokemonController.getReducedPokemonData(pokemon));
        const savedPokemons = user.savedPokemons.map((pokemon) => pokemonController.getReducedPokemonData(pokemon));
        return {
            username: user.username,
            pokemons: pokemons,
            savedPokemons: savedPokemons,
        } */
       return user;
    }
    catch (e) {
        console.error(e);
        return {
            error: e.message,
        }
    }
}
const removePokemonFromPc = async (username, pokemonId) => {
    try {
        const user = await User.findOne({ username }).populate("pokemons");
        await user.populate("savedPokemons");
        if(user.pokemons.length >= 6){
            throw new Error("No puedes guardar más de 6 pokemons");
        }
        const pokemon = user.savedPokemons.find((pokemon) => { return pokemon._id.toString() === pokemonId });
        if (!pokemon) {
            throw new Error("No se ha encontrado el pokemon");
        }
        user.pokemons.push(pokemon);
        user.savedPokemons = user.savedPokemons.filter((pokemon) => { return pokemon._id.toString() !== pokemonId });
        await user.save();
        /* const pokemons = user.pokemons.map((pokemon) => pokemonController.getReducedPokemonData(pokemon));
        const savedPokemons = user.savedPokemons.map((pokemon) => pokemonController.getReducedPokemonData(pokemon));
        return {
            username: user.username,
            pokemons: pokemons,
            savedPokemons: savedPokemons,
        } */

        return user;
    }
    catch (e) {
        console.error(e);
        return {
            error: e.message,
        }
    }
}
const getSavedPokemons = async (username) => {

    const user = await User.findOne({ username }).populate("savedPokemons");
    const updatedPokemons =  await updatePokemonsVersion(user.savedPokemons);

    return updatedPokemons;
}
const fixStatMultiplier = (stats) => {
    for (const stat of stats) {
        stat.multiplier = 1;
    }
    return stats;
}
const updatePokemonsVersion = async (pokemons) => {

    const updatedPokemons = await Promise.all(pokemons.map(async (pokemon) => {
        if(pokemon.sprites.versions){
            const newPokemon = pokemonController.getReducedPokemonData(pokemon);
            newPokemon._id = pokemon._id;
            await pokemonController.updatePokemon(newPokemon);
            return newPokemon;
        }
        return pokemon;
    }))
    return updatedPokemons;
}
const getUserPokemons = async (username) => {
    const user = await User.findOne({ username }).populate("pokemons");
    const updatedPokemons = await updatePokemonsVersion(user.pokemons);
    return updatedPokemons;
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
    const user = await User.findOne({ username }).populate("pokemons");
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
    if (id1 === id2) {
        return;
    }
    const user = await User.findOne({ username }).populate("pokemons");
    await user.populate("savedPokemons");
    const pokemons = user.pokemons;
    const savedPokemons = user.savedPokemons;
    let index1 = pokemons.findIndex((pokemon) => { return pokemon._id.toString() === id1 });
    let index2 = pokemons.findIndex((pokemon) => { return pokemon._id.toString() === id2 });
    let index1Pc = savedPokemons.findIndex((pokemon) => { return pokemon._id.toString() === id1 });
    let index2Pc = savedPokemons.findIndex((pokemon) => { return pokemon._id.toString() === id2 });
    if ((index1 === -1 && index1Pc === -1) || (index2 === -1 && index2Pc === -1)) {
        throw new Error("No se han encontrado los pokemons");
    }
    const pokemon1 = index1 === -1 ? savedPokemons[index1Pc] : pokemons[index1];
    const pokemon2 = index2 === -1 ? savedPokemons[index2Pc] : pokemons[index2];
    
    if ((index1 === 0 && pokemon2.hp === 0) || (index2 === 0 && pokemon1.hp === 0)) {
        return {
            username: user.username,
            pokemons: pokemons,//.map((pokemon) => pokemonController.getReducedPokemonData(pokemon)),
            savedPokemons : savedPokemons//.map((pokemon) => pokemonController.getReducedPokemonData(pokemon))
        }
    }
    const aux = pokemon1;
    if (index1 !== -1) {
        pokemons[index1] = pokemon2;
    }
    else {
        savedPokemons[index1Pc] = pokemon2;
    }
    if (index2 !== -1) {
        pokemons[index2] = aux;
    }
    else {
        savedPokemons[index2Pc] = aux;
    }
    user.pokemons = pokemons;
    user.savedPokemons = savedPokemons;
    await user.save();
    return user;
    /* 
    const reducedPokemons = pokemons.map((pokemon) => pokemonController.getReducedPokemonData(pokemon));
    const reducedSavedPokemons = savedPokemons.map((pokemon) => pokemonController.getReducedPokemonData(pokemon));
    return {
        username: user.username,
        pokemons: reducedPokemons,
        savedPokemons : reducedSavedPokemons,
    } */
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

const getUser = async (username) => {
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
// funcion para eliminar el pokemon salvaje contra el que se ha luchado

const clearFight = async (username) => {
    try {
        const user = await User.findOne({ username }).populate("pokemons");
        if (user.enemies.length > 0) {
            for (const enemy of user.enemies) {
                try {
                    const pokemon = await Pokemon.findById(enemy._id);
                    if (!pokemon || pokemon.owner) {
                        continue;
                    }
                    await Pokemon.findByIdAndDelete(enemy._id);
                }
                catch (e) {
                    console.error(e);
                }
            }
            user.enemies = [];
            await user.save();
        }
    }
    catch (e) {
        console.error(e);
    }
}

/*
get all users
*/
const getAllUsers = async () => {
    const users = await User.find({})
    return users;
}

/*
get all users with pokemons
*/
const getConnectedUsers = async () => {
    const users = await User.find({isConnected:true})
    return users;
}
const connectUser = async (username) => {
    const user = await User.findOne({username});
    if(!user){
        return;
    }
    user.isConnected = true;
    const lastLogin = Date.now();
    // if it has passed more than 1 hour since last login, we add 1 to loginCount
    if(lastLogin - user.lastLogin > 60*60*1000){
        user.loginCount++;
    }

    user.lastLogin = lastLogin;
    await user.save();
}

const disconnectUser = async (username) => {
    const user = await User.findOne({username});
    if(!user){
        return;
    }
    user.isConnected = false;
    user.activeTime += (Date.now() - user.lastLogin) / 1000;
    await user.save();
}
export default {
    addPokemonToUser,
    getUserPokemons,
    setUserPokemons,
    healPokemons,
    swapPokemons,
    removePokemon,
    getUser,
    clearFight,
    savePokemonToPc,
    getSavedPokemons,
    removePokemonFromPc,
    getAllUsers,
    getConnectedUsers,
    connectUser,
    disconnectUser,
}