import { get } from "mongoose";
import Pokemon from "../models/pokemon.js";

const pokemonUrl = 'https://pokeapi.co/api/v2/pokemon';



const getSpecies = async( pokemon )=>{
    const speciesUrl = pokemon.species.url;
    const response = await fetch(speciesUrl);
    const data = await response.json();
    return data;
}
const getEvolutionChain = async( species )=>{
    const evolutionChainUrl = species.evolution_chain.url;
    const response = await fetch(evolutionChainUrl);
    const data = await response.json();
    return data;
}
const getEvolutionChainData = async( evolutionChain )=>{
    const chain = evolutionChain.chain;
    const evolutionChainData = [];
    let evolvesTo = chain.evolves_to;
    while(evolvesTo.length > 0){
        const evolution = evolvesTo[0];
        const evolutionData ={
            name: evolution.species.name,
            level: evolution.evolution_details[0].min_level,
            trigger: evolution.evolution_details[0].trigger.name,
        }
        evolutionChainData.push(evolutionData);
        evolvesTo = evolution.evolves_to;
    }
    return evolutionChainData;
    /* const chain = evolutionChain.chain;
    const evolutionChainData = [];
    evolutionChainData.push(chain.species.name);
    let evolvesTo = chain.evolves_to;
    while(evolvesTo.length > 0){
        const evolution = evolvesTo[0];
        const evolutionData ={
            name: evolution.species.name,
            level: evolution.evolution_details[0].min_level,
        }
        evolutionChainData.push(evolutionData);
    }
    return evolutionChainData; */
}

const getEvolutions = async( pokemon )=>{
    const species = await getSpecies(pokemon);
    const evolutionChain = await getEvolutionChain(species);
    const evolutionChainData = await getEvolutionChainData(evolutionChain);
    return evolutionChainData;
}

const fetchPokemon = async (id) => {
    try {
        const url = `${pokemonUrl}/${id}`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}
const filterMovesByLevel = (moves, level) => {
    const filteredMoves = moves.filter((move) => {
        return move.version_group_details[0].level_learned_at <= level && move.version_group_details[0].move_learn_method.name === 'level-up';
    });
    return filteredMoves;
}
const getNRandomUniqueMoves = async (moves, n) => {
    const movesToChoose = [...moves];
    const chosenMoves = [];
    /* try to get n moves with their data, prioritizing moves with  power */
    while (chosenMoves.length < n && movesToChoose.length > 0) {
        const randomIndex = Math.floor(Math.random() * movesToChoose.length);
        const move = movesToChoose[randomIndex];
        const moveData = await getMoveData(move);
        if (moveData.power !== null) {
            chosenMoves.push(moveData);
        }
        movesToChoose.splice(randomIndex, 1);
    }
    return chosenMoves;
}
const getMaxHp = (pokemon) => {
    if(!pokemon.stats[0].multiplier){
        pokemon.stats[0].multiplier = 1;
    }
    const baseHp = Math.round(pokemon.stats[0].base_stat * pokemon.stats[0].multiplier);

    const hp = Math.floor(0.01 * (2 * parseInt(baseHp) ) * pokemon.level + 10 + pokemon.level);
    console.log("hp", hp)
    return hp;
}
const randomizeStatValues = (stats) => {
    const newStats = [...stats];
    for (let i = 0; i < newStats.length; i++) {
        const randomValue = 0.75 + Math.random() * 0.5;
        newStats[i].multiplier = randomValue;
    }
    return newStats;
}

const copyStatMultipliers = (statsFrom,statsTo) => {
    for (let i = 0; i < statsFrom.length; i++) {
        statsTo[i].multiplier = statsFrom[i].multiplier || 1;
    }
    return statsTo;
}

const getNewPokemon = async (id,level=5)=>{
    try {
        level = Math.min(level,100);
        const pokemon = await fetchPokemon(id);
        pokemon.level = level;
        const evolutions = await getEvolutions(pokemon);
        const availableMoves = filterMovesByLevel(pokemon.moves, level);
        const activeMoves = await getNRandomUniqueMoves(availableMoves, 4);
        const isShiny = Math.random() < 0.1;
        pokemon.stats = randomizeStatValues(pokemon.stats);
        const newPokemon = {
            name: pokemon.name,
            level: level,
            sprites: pokemon.sprites,
            types: pokemon.types,
            stats: pokemon.stats,
            abilities: pokemon.abilities,
            moves: pokemon.moves,
            activeMoves: activeMoves,
            evolutions: evolutions || [],
            baseHp: pokemon.stats[0].base_stat,
            maxHp: getMaxHp(pokemon),
            hp: getMaxHp(pokemon),
            id: pokemon.id,
            shiny:isShiny
    
        }
        return newPokemon;
    } catch (error) {
        return null;
    }

}
const getNewRandomPokemon = async (level=5)=>{
    const randomId = Math.floor(Math.random() * 151) + 1;
    const newPokemon = await getNewPokemon(randomId,level);
    return newPokemon;
}
const getPokemons = async (idList,level=5) => {
    const pokemons = await Promise.all(idList.map(async (id) => {
        const pokemon = await getNewPokemon(id,level);
        return pokemon;
    }));
    return pokemons;
}

const getStarterPokemons = async () => {
    const starterPokemons = await getPokemons([1, 4, 7],5);
    return starterPokemons;
}
/*
funcionalidades para un pokemon
evolucionar
subir de nivel
*/
const isEvolving = (pokemon) => {
    if(pokemon.evolutions.length === 0){
        return false;
    }
    const evolution = pokemon.evolutions.find((evolution) => {
        return evolution.level === pokemon.level;
    });
    return evolution !== undefined;
}
const updatePokemon = async (pokemon) => {
    const pokemonFromDb = await Pokemon.findById(pokemon._id);
    pokemonFromDb.name = pokemon.name;
    pokemonFromDb.level = pokemon.level;
    pokemonFromDb.sprites = pokemon.sprites;
    pokemonFromDb.types = pokemon.types;
    pokemonFromDb.stats = pokemon.stats;
    pokemonFromDb.abilities = pokemon.abilities;
    pokemonFromDb.moves = pokemon.moves;
    pokemonFromDb.activeMoves = pokemon.activeMoves;
    pokemonFromDb.evolutions = pokemon.evolutions;
    pokemonFromDb.baseHp = pokemon.baseHp;
    pokemonFromDb.maxHp = pokemon.maxHp;
    pokemonFromDb.hp = pokemon.hp;
    pokemonFromDb.id = pokemon.id;
    pokemonFromDb.shiny = pokemon.shiny;
    await pokemonFromDb.save();
    return pokemonFromDb;

}
const evolve = async (pokemon) => {
    if(!isEvolving(pokemon)){
        return pokemon;
    }
    const evolution = pokemon.evolutions.find((evolution) => {
        return evolution.level === pokemon.level;
    });
    const evolvedPokemon = await getNewPokemon(evolution.name,pokemon.level);
    evolvedPokemon._id = pokemon._id;
    evolvedPokemon.shiny = pokemon.isShiny;
    evolvedPokemon.activeMoves = pokemon.activeMoves;
    evolvedPokemon.hp = pokemon.hp;
    evolvedPokemon.stats = copyStatMultipliers(pokemon.stats,evolvedPokemon.stats);
    /* update pokemon in db */
    if(pokemon._id){
        const newPokemon = await updatePokemon(evolvedPokemon);
        return newPokemon;
    }
    return evolvedPokemon;
}
const addMove = async(pokemon,move)=>{
    
    
    const moveData = await getMoveData(move);
    const newPokemon =  await Pokemon.findById(pokemon._id);
    newPokemon.activeMoves.push(moveData);
    if(newPokemon.activeMoves.length > 4){
        const originalOrder = pokemon.activeMoves.map((move)=>{return move.name});
        console.log("originalOrder",originalOrder)
        const activeMoves = [...newPokemon.activeMoves]
        activeMoves.sort((a,b)=>{return b.power - a.power});
        while(activeMoves.length > 4){
            activeMoves.pop();
        }
        const newActiveMoves = [];
        for(const move of originalOrder){
            const moveData = activeMoves.find((activeMove)=>{return activeMove.name === move});
            if(moveData){
                newActiveMoves.push(moveData);
            }
        }
        /* meter los que no estan en el orden original */
        for(const move of activeMoves){
            if(!newActiveMoves.includes(move)){
                newActiveMoves.push(move);
            }
        }

        /* order as original */
        newPokemon.activeMoves = newActiveMoves;
        
        
    }

    await newPokemon.save();
    return newPokemon;
}
    
const addLevel = async(pokemon) => {
    if(pokemon.level >= 100){
        return pokemon;
    }
    const dbPokemon = await Pokemon.findById(pokemon._id);
    dbPokemon.level++;
    dbPokemon.maxHp = getMaxHp(dbPokemon);
    await dbPokemon.save();
    const evolvedPokemon = await evolve(dbPokemon);
    pokemon = evolvedPokemon;
    console.log("pokemon",pokemon)

    const availableMoves = filterMovesByLevel(pokemon.moves, pokemon.level);
    const levelMoves = availableMoves.filter((move) => {
        return move.version_group_details[0].level_learned_at === pokemon.level;
    });
    console.log("availableMoves",availableMoves.map((move)=>{return move.move.name+" " + move.version_group_details[0].level_learned_at}));
    console.log("levelMoves",levelMoves.map((move)=>{return move.move.name + " " + move.version_group_details[0].level_learned_at}));
    for(const move of levelMoves){
        pokemon = await addMove(pokemon,move);
    }
    
    return pokemon;
}

const getPokemonsFromDb = async (req, res) => {
    try {
        const pokemons = await Pokemon.find();
        res.status(200).json(pokemons);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const getTypeData = async(type) =>{
    const url = type.url;
    const response = await fetch(url);
    const data = await response.json()
    return {
        name:data.name,
        double_damage_to:data.damage_relations.double_damage_to,
        half_damage_to:data.damage_relations.half_damage_to,
        no_damage_to:data.damage_relations.no_damage_to,
    }
}

const getMoveData = async(move) =>{
    const url = move.move.url;
    const response = await fetch(url);
    const data = await response.json()
    const typeData = await getTypeData(data.type);
    data.type = typeData;
    return {
        name:data.name,
        power:data.power || 0,
        accuracy:data.accuracy,
        type:data.type,
        url:move.url,
        level_learned_at:move.version_group_details[0].level_learned_at,
    }
}


const getDamage = (attacker,defender,move) =>{
    if(!attacker.stats[1].multiplier){
        attacker.stats[1].multiplier = 1;
    }
    if(!defender.stats[2].multiplier){
        defender.stats[2].multiplier = 1;
    }
    const attack = Math.round(attacker.stats[1].base_stat * attacker.stats[1].multiplier);
    const defense = Math.round(defender.stats[2].base_stat * defender.stats[2].multiplier);
    let damage = (((2 * attacker.level / 5) + 2) * (move.power * attack / defense) / 50) + 2;
    let typeMultiplier = 1;
    move.type.double_damage_to.forEach((type)=>{
        if(defender.types.find((pokemonType)=>{return pokemonType.type.name === type.name})){
            typeMultiplier *= 2;
        }
    });
    move.type.half_damage_to.forEach((type)=>{
        if(defender.types.find((pokemonType)=>{return pokemonType.type.name === type.name})){
            typeMultiplier *= 0.5;
        }
    });
    move.type.no_damage_to.forEach((type)=>{
        if(defender.types.find((pokemonType)=>{return pokemonType.type.name === type.name})){
            typeMultiplier *= 0;
        }
    });
    damage *= typeMultiplier;
    damage = Math.round(damage);
    return {damage,typeMultiplier};
}

const attack = async(attacker,defender,move,save=false)=> {
    if(attacker.hp <= 0 || defender.hp <= 0 || !move){
        return {attacker,defender,damage:0,typeMultiplier:1,move};
    }
    //let damage = move.power * attacker.level;
    let {damage,typeMultiplier} = getDamage(attacker,defender,move);
    defender.hp -= damage;
    if(defender.hp < 0){
        defender.hp = 0;
    }
    if(save){
        if(attacker._id){
            const attackerDb = await Pokemon.findById(attacker._id);
            attackerDb.hp = attacker.hp;
            await attackerDb.save();

        }
        if(defender._id){
            const defenderDb = await Pokemon.findById(defender._id);
            defenderDb.hp = defender.hp;
            await defenderDb.save();
        }
    }
    return {attacker,defender,damage,typeMultiplier,move};
}


export default {
    filterMovesByLevel,
    getNRandomUniqueMoves,
    isEvolving,
    getPokemonsFromDb,
    getNewPokemon,
    addLevel,
    fetchPokemon,
    evolve,
    getNewRandomPokemon,
    getStarterPokemons,
    getPokemons,
    attack

}