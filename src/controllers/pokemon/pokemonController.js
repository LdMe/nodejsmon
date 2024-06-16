import dotenv from "dotenv";
import Pokemon from "../../models/pokemon.js";
import PokemonTemplate from "../../models/templates/pokemon.js";
import { getReducedTypeData, getTypesData } from "./typeController.js";
import { filterMovesByLevel, getMoveIdFromName, getNRandomUniqueMovesForLevel, getReducedMoveDataFromDb, getMoveData, changeBadMoveForGoodMove, addMove } from "./moveController.js";
import { getMaxHp, randomizeStatValues, copyStatMultipliers } from "./statsController.js";
import { evolve, getEvolutions } from "./evolutionController.js";
import { getSpecies } from "./speciesController.js";
import { fetchData } from "./utils.js";

dotenv.config();

const pokemonUrl = 'https://pokeapi.co/api/v2/pokemon';
const MAX_POKEMON = process.env.MAX_POKEMON || 2;

const fetchAllPokemonsFromApi = async () => {

    for (let i = 1; i <= MAX_POKEMON; i++) {
        console.log("fetching pokemon", i);
        const pokemon = await fetchPokemon(i);
        const types = await getTypesData(pokemon);
    }
}

const fetchPokemon = async (idOrName) => {
    try {
        const existingPokemon = await PokemonTemplate.findOne({ $or: [{ id: idOrName }, { name: idOrName }] });

        if (existingPokemon) {
            return existingPokemon;
        }
        const url = `${pokemonUrl}/${idOrName}`;
        const [error, data] = await fetchData(url);
        if (error) throw error;

        const reducedPokemon = getReducedPokemonData(data);
        const shortPokemon = await PokemonTemplate.create(reducedPokemon);
        await shortPokemon.save();
        return shortPokemon;
    } catch (error) {
        console.error(error);
        return null;
    }
};


const getNewPokemon = async (id, options = {}) => {
    const defaultOptions = { level: 5, stats: null, activeMoves: [], canBeShiny: false, save: false, trainer: false };
    const { level, stats, activeMoves, canBeShiny, save, trainer } = { ...defaultOptions, ...options };
    try {

        let pokemon = await fetchPokemon(id);
        pokemon.level = Math.min(level, 100);
        let evolutions = await getEvolutions(pokemon);
        pokemon.evolutions = evolutions;

        const evolvedName = evolve(pokemon);
        if (evolvedName && evolvedName !== pokemon.name) {
            const newPokemon = await fetchPokemon(evolvedName);
            if (newPokemon.id <= MAX_POKEMON) {
                pokemon = newPokemon;
                pokemon.level = level;
                evolutions = await getEvolutions(pokemon);
                pokemon.evolutions = evolutions;
            }
        }
        let newActiveMoves = activeMoves;
        if (newActiveMoves.length === 0) {
            newActiveMoves = await getNRandomUniqueMovesForLevel(pokemon.moves, level, 4);
            if (trainer) {
                console.log("trainer", trainer, newActiveMoves, pokemon.moves, level);
                newActiveMoves = await changeBadMoveForGoodMove(newActiveMoves, pokemon.moves, level);
            }
        }
        const isShiny = canBeShiny && Math.random() < 0.1;
        if (stats) {
            pokemon.stats = copyStatMultipliers(stats, pokemon.stats);
        } else {
            pokemon.stats = randomizeStatValues(pokemon.stats);
        }
        const types = await getTypesData(pokemon, true);
        const species = await getSpecies(pokemon);

        const dbActiveMoves = await Promise.all(newActiveMoves.map(async (move) => {
            const moveData = await getMoveData(move, true);
            return moveData;
        }));

        const newPokemon = {
            name: pokemon.name,
            level: level,
            sprites: pokemon.sprites,
            stats: pokemon.stats,
            abilities: pokemon.abilities,
            moves: pokemon.moves,
            evolutions: evolutions || [],
            baseHp: pokemon.stats[0].base_stat,
            maxHp: getMaxHp(pokemon),
            hp: getMaxHp(pokemon),
            id: pokemon.id,
            shiny: isShiny,
            types: types,
            species: species._id,
            activeMoves: dbActiveMoves

        }
        if (save) {
            const newPokemonDb = new Pokemon(newPokemon);
            await newPokemonDb.save();
            return newPokemonDb;
        }
        return newPokemon;
    } catch (error) {
        console.error(error);
        return null;
    }

}
const getCurrentEvolution = (pokemon) => {
    const evolution = pokemon.evolutions.find((evolution) => evolution.name === pokemon.name);
    return evolution;
}
const getPokemonEvolutionTrigger = (pokemon) => {
    const evolution = getCurrentEvolution(pokemon)
    if (!evolution) {
        return null;
    }
    return evolution.trigger;
}
const checkEvolutionIsCorrectForWildPokemon = (pokemon) => {
    if (pokemon === null) {
        return false;
    }
    if (pokemon.species.is_baby || pokemon.species.is_mythical || pokemon.species.is_legendary || getPokemonEvolutionTrigger(pokemon) !== "level-up") {
        return false;
    }
    const currentEvolution = getCurrentEvolution(pokemon);
    if (!currentEvolution || currentEvolution.level > pokemon.level || currentEvolution.level === null) {
        return false;
    }
    return true;
}
const getNewRandomPokemon = async (level = 5, trainer = false) => {

    let randomId = Math.floor(Math.random() * MAX_POKEMON) + 1;
    let newPokemon = await getNewPokemon(randomId, { level, trainer });

    while (!checkEvolutionIsCorrectForWildPokemon(newPokemon)) {
        randomId = Math.floor(Math.random() * MAX_POKEMON) + 1;
        newPokemon = await getNewPokemon(randomId, { level, trainer });

    }
    const newPokemonDb = new Pokemon(newPokemon);
    await newPokemonDb.save();
    return newPokemonDb;
}

const getPokemons = async (idList, level = 5) => {
    const pokemons = await Promise.all(idList.map(async (id) => {
        const pokemon = await getNewPokemon(id, { level, canBeShiny: false });
        return pokemon;
    }));
    return pokemons;
}

const getStarterPokemons = async () => {
    const starterPokemons = await getPokemons([1, 4, 7], 5);
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


const addLevel = async (pokemonId) => {
    try {

        let dbPokemon = await Pokemon.findById(pokemonId);
        await dbPokemon.populate("owner")
        const owner = dbPokemon.owner;
        if (owner && owner.maxLevel <= dbPokemon.level) {
            return dbPokemon;
        }
        if (dbPokemon.level >= 100) {
            return dbPokemon;
        }
        dbPokemon.level++;
        dbPokemon.maxHp = getMaxHp(dbPokemon);
        await dbPokemon.save();

        const evolvedPokemonName = await evolve(dbPokemon);
        if (evolvedPokemonName && evolvedPokemonName !== dbPokemon.name) {
            const evolvedPokemon = await getNewPokemon(evolvedPokemonName, { level: dbPokemon.level, stats: dbPokemon.stats, activeMoves: dbPokemon.activeMoves });
            evolvedPokemon._id = dbPokemon._id;
            evolvedPokemon.hp = dbPokemon.hp;
            evolvedPokemon.shiny = dbPokemon.shiny;
            dbPokemon = await updatePokemon(evolvedPokemon);
        }

        const availableMoves = filterMovesByLevel(dbPokemon.moves, dbPokemon.level);
        const levelMoves = availableMoves.filter((move) => {
            return move.level === dbPokemon.level;
        });
        for (const move of levelMoves) {
            dbPokemon = await addMove(dbPokemon, move);
        }

        return dbPokemon;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}

const getPokemonsFromDb = async (idList = null) => {
    try {
        let pokemons = [];
        if (idList) {
            pokemons = await Pokemon.find({ _id: { $in: idList } });
        }
        else {
            pokemons = await Pokemon.find();
        }
        return pokemons;
    } catch (error) {
        console.error(error);
        return [];
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

const getPokemonTemplatesFromDb = async (idList = null) => {
    try {
        let pokemons = [];
        if (idList) {
            pokemons = await PokemonTemplate.find({ _id: { $in: idList } });
        }
        else {

            pokemons = await PokemonTemplate.find();
        }
        return pokemons.sort((a, b) => { return a.id - b.id });
    } catch (error) {
        console.error(error);
        return [];
    }
}

const getPokemonTemplateFromDb = async (id) => {
    try {
        const pokemon = await PokemonTemplate.findById(id);
        return pokemon;
    } catch (error) {
        console.error(error);
        return null;
    }
}

const getDamage = async (attacker, defender, moveName) => {
    const move = await getMoveData(moveName);
    if (move.power === null) {
        move.power = 0;
        await move.save();
    }
    await move.populate("type");
    if (!attacker.stats[1].multiplier) {
        attacker.stats[1].multiplier = 1;
    }
    if (!defender.stats[2].multiplier) {
        defender.stats[2].multiplier = 1;
    }
    const attack = Math.round(attacker.stats[1].base_stat * attacker.stats[1].multiplier);
    const defense = Math.round(defender.stats[2].base_stat * defender.stats[2].multiplier);

    let damage = (((2 * attacker.level / 5) + 2) * (move.power * attack / defense) / 50) + 2;
    let typeMultiplier = 1;
    move.type.damage_relations.double_damage_to.forEach((type) => {
        if (defender.types.find((pokemonType) => { return pokemonType.name === type.name })) {
            typeMultiplier *= 2;
        }
    });
    move.type.damage_relations.half_damage_to.forEach((type) => {
        if (defender.types.find((pokemonType) => { return pokemonType.name === type.name })) {
            typeMultiplier *= 0.5;
        }
    });
    move.type.damage_relations.no_damage_to.forEach((type) => {
        if (defender.types.find((pokemonType) => { return pokemonType.name === type.name })) {
            typeMultiplier *= 0;
        }
    });
    damage *= typeMultiplier;
    damage = Math.round(damage);
    return { damage, typeMultiplier };
}

const attack = async (attackerId, defenderId) => {
    try {

        let attacker = await getPokemonByIdFromDb(attackerId);
        let defender = await getPokemonByIdFromDb(defenderId);
        if (!attacker || !defender) {
            return { error: "Pokemon no encontrado" }
        }
        if (attacker.hp <= 0 || defender.hp <= 0) {
            return { attacker, defender, damage: 0, typeMultiplier: 1, move: null };
        }
        const randomIndex = Math.floor(Math.random() * attacker.activeMoves.length);
        const move = attacker.activeMoves[randomIndex];

        //let damage = move.power * attacker.level;
        let { damage, typeMultiplier } = await getDamage(attacker, defender, move);
        if (damage < 0) {
            damage = 0;
        }
        defender.hp -= damage;

        defender.hp = Math.round(defender.hp);
        if (defender.hp < 0) {
            defender.hp = 0;
        }
        // por ahora no guardamos cambios en el atacante
        /* if (attacker._id) {
            const attackerDb = await Pokemon.findById(attacker._id);
            attackerDb.hp = attacker.hp;
            await attackerDb.save();

        } */
        if (defender._id) {

            const defenderDb = await Pokemon.findById(defender._id);
            defenderDb.hp = defender.hp;
            await defenderDb.save();
        }

        return {
            attacker,
            defender,
            damage,
            typeMultiplier,
            move
        };
    }
    catch (error) {
        console.error(error);
        return null;
    }
}

const deletePokemon = async (pokemonId) => {
    try {
        const pokemon = await Pokemon.findById(pokemonId);
        if (!pokemon || pokemon.owner) {
            return null;
        }
        await Pokemon.findByIdAndDelete(pokemonId);
        return pokemon;
    } catch (error) {
        console.error(error);
        return null;
    }
}
const getReducedPokemonData = (pokemon, short = false) => {
    const types = pokemon.types.map((type) => {
        return type.type?.name || type.name || type;
    });
    if (pokemon.moves) {
        pokemon.moves = pokemon.moves.map((move) => {
            return {
                name: move.move.name,
                level: move.version_group_details[0].level_learned_at,
                method: move.version_group_details[0].move_learn_method.name
            }
        });
    }
    const sprites = {
        front_default: pokemon.sprites.versions['generation-v']['black-white'].animated.front_default,
        front_shiny: pokemon.sprites.versions['generation-v']['black-white'].animated.front_shiny,
        back_default: pokemon.sprites.versions['generation-v']['black-white'].animated.back_default,
        back_shiny: pokemon.sprites.versions['generation-v']['black-white'].animated.back_shiny,
    }
    let nextEvolution = null;
    if (pokemon.evolutions) {
        const currentEvolutionIndex = pokemon.evolutions.findIndex((evolution) => evolution.name === pokemon.name);
        const nextEvolutionIndex = currentEvolutionIndex + 1;
        nextEvolution = nextEvolutionIndex < pokemon.evolutions.length ? pokemon.evolutions[nextEvolutionIndex] : null;
    }
    if (short) {
        const newPokemon = {
            id: pokemon.id,
            _id: pokemon._id,
            name: pokemon.name,
            sprites: sprites,
        }
        return newPokemon;
    }
    const newPokemon = {
        _id: pokemon._id,
        name: pokemon.name,
        names: pokemon.names,
        level: pokemon.level,
        sprites: sprites,
        stats: pokemon.stats,
        abilities: pokemon.abilities,
        activeMoves: pokemon.activeMoves,
        moves: pokemon.moves,
        baseHp: pokemon.baseHp,
        maxHp: pokemon.maxHp,
        hp: pokemon.hp,
        id: pokemon.id,
        shiny: pokemon.shiny,
        types: types,
        nextEvolution: nextEvolution,
        evolutions: pokemon.evolutions,
        species: pokemon.species,
    }
    //PokemonShort.findByIdAndUpdate( pokemon._id ,newPokemon,{ upsert: true  });
    return newPokemon;
}
export default {
    getNewPokemon,
    addLevel,
    getNewRandomPokemon,
    getStarterPokemons,
    attack,
    getPokemonsFromDb,
    getPokemonByIdFromDb,
    getPokemonTemplatesFromDb,
    deletePokemon,
    fetchAllPokemonsFromApi,
    fetchPokemon,
    getReducedPokemonData,
    updatePokemon

}

export {
    getNewPokemon,
    addLevel,
    getNewRandomPokemon,
    getStarterPokemons,
    attack,
    getPokemonsFromDb,
    getPokemonByIdFromDb,
    getPokemonTemplatesFromDb,
    deletePokemon,
    fetchPokemon,
    getReducedPokemonData,
    updatePokemon
}