import User from "../models/user.js";
import Pokemon from "../models/pokemon.js";
import pokemonController, { getNewPokemon } from "./pokemon/pokemonController.js";
const addPokemonToUser = async (username, pokemonId) => {
    
    const user = await User.findOne({ username }).populate("pokemons");
    
    if (user.pokemons.length >= 6) {
        throw new Error("No puedes tener más de 6 pokemons");
    }
    if(user.pokemons.find((pokemon)=>{return pokemon._id.toString() === pokemonId.toString()})){
        throw new Error("Ya tienes este pokemon");
    }
    let pokemon = null;
    try {
        // if pokemonId is a valid id, we search for it in the db
        if(pokemonId.length === 24){
            pokemon = await Pokemon.findById(pokemonId);
        }
        // if pokemonId is a valid name, we search for it in the db
        else{
            pokemon = await getNewPokemon(pokemonId,{level:5});
        }
        
    } catch (error) {
        
        throw new Error("No se ha encontrado el pokemon");
    }
    if(!pokemon._id){
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

const fixStatMultiplier = (stats) => {
    for (const stat of stats) {
        stat.multiplier = 1;
    }
    return stats;
}
const getUserPokemons = async (username) => {
    const user = await User.findOne({ username }).populate("pokemons");
    return user.pokemons.map((pokemon) => pokemonController.getReducedPokemonData(pokemon));
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
    if(id1 === id2){
        return;
    }
    const user = await User.findOne({ username }).populate("pokemons");
    const pokemons = user.pokemons;
    const index1 = pokemons.findIndex((pokemon) => { return pokemon._id.toString() === id1 });
    const index2 = pokemons.findIndex((pokemon) => { return pokemon._id.toString() === id2 });
    if (index1 === -1 || index2 === -1) {
        throw new Error("No se han encontrado los pokemons");
    }
    if((index1 === 0 && pokemons[index2].hp === 0) || (index2 === 0 && pokemons[index1].hp === 0)){
        return {
            username: user.username,
            pokemons: pokemons.map((pokemon) => pokemonController.getReducedPokemonData(pokemon))
        }
    }
    const aux = pokemons[index1];
    pokemons[index1] = pokemons[index2];
    pokemons[index2] = aux;
    user.pokemons = pokemons;
    await user.save();
    const reducedPokemons = pokemons.map((pokemon) => pokemonController.getReducedPokemonData(pokemon));
    return {
        username: user.username,
        pokemons: reducedPokemons
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
// funcion para eliminar el pokemon salvaje contra el que se ha luchado

const clearFight = async (username) => {
    try{
        const user = await User.findOne({ username }).populate("pokemons");
        if(user.enemies.length > 0){
            for(const enemy of user.enemies){
                try{
                    const pokemon = await Pokemon.findById(enemy._id);
                    if (!pokemon || pokemon.owner) {
                        continue;
                    }
                    await Pokemon.findByIdAndDelete(enemy._id);
                }
                catch(e){
                    console.error(e);
                }
            }
            user.enemies = [];
            await user.save();
        }
    }
    catch(e){
        console.error(e);
    }
}

export default {
    addPokemonToUser,
    getUserPokemons,
    setUserPokemons,
    healPokemons,
    swapPokemons,
    removePokemon,
    getUser,
    clearFight
}