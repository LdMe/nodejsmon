import speciesController from "./speciesController.js";
import { fetchData } from "./utils.js";
import EvolutionTemplate from "../../models/templates/evolutionChain.js";

const isEvolving = (pokemon) => {
    if (pokemon.evolutions.length === 0) {
        return false;
    }
    const evolution = pokemon.evolutions.find((evolution) => {
        return evolution.level <= pokemon.level && evolution.trigger === "level-up" && evolution.name !== pokemon.name;
    });
    return evolution !== undefined;
}

const getEvolutionChain = async (species) => {
    
    const evolutionChainUrl = species.evolution_chain.url;
    const existingEvolutionChain = await EvolutionTemplate.findOne({ url: evolutionChainUrl });
    if (existingEvolutionChain) {
        return existingEvolutionChain;
    }
    const [error, data] = await fetchData(evolutionChainUrl);
    if (error) {
        throw error;
    }
    const evolutionChain = new EvolutionTemplate(data);
    evolutionChain.species = getEvolutionChainData(evolutionChain);
    evolutionChain.url = evolutionChainUrl;
    evolutionChain.save();
    return data;
}
const getEvolutionChainData = (evolutionChain) => {
    const chain = evolutionChain.chain;
    const evolutionChainData = [];
    const firstTrigger = chain.evolution_details.length > 0 ? chain.evolution_details[0].trigger.name : "level-up";
    evolutionChainData.push({ name: chain.species.name, level: 0, trigger: firstTrigger, isBaby: chain.is_baby });
    let evolvesTo = chain.evolves_to;
    while (evolvesTo.length > 0) {
        const evolution = evolvesTo[0];
        const evolutionData = {
            name: evolution.species.name,
            level: evolution.evolution_details[0].min_level,
            trigger: evolution.evolution_details[0].trigger.name,
            item: evolution.evolution_details[0].item,
            isBaby: evolution.is_baby,
        }
        evolutionChainData.push(evolutionData);
        evolvesTo = evolution.evolves_to;
    }
    return evolutionChainData;
}

const getEvolutions = async (pokemon) => {
    const species = await speciesController.getSpecies(pokemon.id || pokemon);
    const evolutionChain = await getEvolutionChain(species);
    const evolutionChainData = getEvolutionChainData(evolutionChain);
    return evolutionChainData;
}

/**
 * define PokemonObject
 * @typedef {Object} PokemonObject
 * @property {String} name
 * @property {Number} level
 * @property {Array} evolutions
 **/
/**
 * 
 * @param {PokemonObject} pokemon
 * @returns 
 */
const evolve = (pokemon) => {
    if (!isEvolving(pokemon)) {
        return pokemon.name;
    }

    const currentEvolution = pokemon.evolutions.find((evolution) => {
        return evolution.name === pokemon.name;
    });
    if(currentEvolution?.trigger !=="level-up" && pokemon.level >=35){
        return pokemon.name;
    }
    // ordenar evoluciones por nivel y filtrar las que sean menores o iguales al nivel del pokemon
    const sortedEvolutions = pokemon.evolutions.sort((a, b) => { return a.level - b.level });

    // Filtrar evoluciones que sean menores o iguales al nivel del Pokémon
    const lowerEvolutions = sortedEvolutions.filter((evolution) => { return evolution.level <= pokemon.level && !evolution.isBaby });

    // Filtrar las evoluciones que no sean por nivel
    const levelUpEvolutions = lowerEvolutions.filter((evolution) => { return evolution.trigger === "level-up" });

    /* si no hay evoluciones, devolver el pokemon */
    if (levelUpEvolutions.length === 0) {
        return pokemon.name;
    }


    // Tomar la última evolución posible dentro del nivel del Pokémon
    return levelUpEvolutions[levelUpEvolutions.length - 1].name;
}


export {
    isEvolving,
    getEvolutions,
    evolve,
}

export default {
    isEvolving,
    getEvolutions,
    evolve
}