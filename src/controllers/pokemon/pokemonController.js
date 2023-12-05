
import Pokemon from "../../models/pokemon.js";
import { getTypesData } from "./typeController.js"; 
import { filterMovesByLevel, getNRandomUniqueMovesForLevel} from "./moveController.js";
import { getMaxHp, randomizeStatValues, copyStatMultipliers } from "./statsController.js";
import { evolve,  getEvolutions } from "./evolutionController.js";
import { addMove } from "./moveController.js";
import { fetchData } from "./utils.js";

const pokemonUrl = 'https://pokeapi.co/api/v2/pokemon';




const fetchPokemon = async (id) => {
    try {
        const url = `${pokemonUrl}/${id}`;
        const [error,data] = await fetchData(url);
        if(error){
            throw error;
        }
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}


const getNewPokemon = async (id,level=5,stats=null,activeMoves=[])=>{
    try {
        level = Math.min(level,100);
        let pokemon = await fetchPokemon(id);
        pokemon.level = level;
        let evolutions = await getEvolutions(pokemon);
        pokemon.evolutions = evolutions;
        const evolvedName = evolve(pokemon);
        if(evolvedName && evolvedName !== pokemon.name){
            pokemon = await fetchPokemon(evolvedName);
            pokemon.level = level;
            evolutions = await getEvolutions(pokemon);
            pokemon.evolutions = evolutions;
        }
        if(activeMoves.length === 0){
            activeMoves = await getNRandomUniqueMovesForLevel(pokemon.moves, level, 4);
        }
        const isShiny = Math.random() < 0.1;
        if(stats){
            pokemon.stats  = copyStatMultipliers(stats,pokemon.stats);
        }
        else{
            pokemon.stats = randomizeStatValues(pokemon.stats);
        }
        const types  = await getTypesData(pokemon);
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
            types: types,
            shiny:isShiny
    
        }
        return newPokemon;
    } catch (error) {
        console.error(error);
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


const addLevel = async(pokemon) => {
    if(pokemon.level >= 100){
        return pokemon;
    }
    const dbPokemon = await Pokemon.findById(pokemon._id);
    dbPokemon.level++;
    dbPokemon.maxHp = getMaxHp(dbPokemon);
    await dbPokemon.save();
    const evolvedPokemonName = await evolve(dbPokemon);
    if(evolvedPokemonName && evolvedPokemonName !== dbPokemon.name){
        const evolvedPokemon = await getNewPokemon(evolvedPokemonName,dbPokemon.level,dbPokemon.stats,dbPokemon.activeMoves);
        evolvedPokemon._id = dbPokemon._id;
        evolvedPokemon.hp = dbPokemon.hp;
        evolvedPokemon.maxHp
        await updatePokemon(evolvedPokemon);
    }

    const availableMoves = filterMovesByLevel(pokemon.moves, pokemon.level);
    const levelMoves = availableMoves.filter((move) => {
        return move.version_group_details[0].level_learned_at === pokemon.level;
    });
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

const getPokemonByIdFromDb = async (id) => {
    try {
        const pokemon = await Pokemon.findById(id);
        return pokemon;
    } catch (error) {
        console.error(error);
        return null;
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
        if(defender.types.find((pokemonType)=>{return pokemonType.name === type.name})){
            typeMultiplier *= 2;
        }
    });
    move.type.half_damage_to.forEach((type)=>{
        if(defender.types.find((pokemonType)=>{return pokemonType.name === type.name})){
            typeMultiplier *= 0.5;
        }
    });
    move.type.no_damage_to.forEach((type)=>{
        if(defender.types.find((pokemonType)=>{return pokemonType.name === type.name})){
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
    
    defender.hp = Math.round(defender.hp);
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
    
    
    
    getNewPokemon,
    addLevel,
    getNewRandomPokemon,
    getStarterPokemons,
    attack,
    getPokemonByIdFromDb

}