import { getSpecies } from "./speciesController.js";
import { fetchData } from "./utils.js";
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
    const [error, data] = await fetchData(evolutionChainUrl);
    if (error) {
        throw error;
    }
    return data;
}
const getEvolutionChainData = async (evolutionChain) => {
    const chain = evolutionChain.chain;
    const evolutionChainData = [];
    evolutionChainData.push({ name: chain.species.name, level: 0, trigger: "level-up" });
    let evolvesTo = chain.evolves_to;
    while (evolvesTo.length > 0) {
        const evolution = evolvesTo[0];
        const evolutionData = {
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

const getEvolutions = async (pokemon) => {
    const species = await getSpecies(pokemon);
    const evolutionChain = await getEvolutionChain(species);
    const evolutionChainData = await getEvolutionChainData(evolutionChain);
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
    /*
     ordenar evoluciones por nivel y filtrar las que sean menores o iguales al nivel del pokemon
    */
    const sortedEvolutions = pokemon.evolutions.sort((a, b) => { return a.level - b.level });
    const lowerEvolutions = sortedEvolutions.filter((evolution) => { return evolution.level <= pokemon.level });
    /* si no hay evoluciones, devolver el pokemon */
    if (lowerEvolutions.length === 0) {
        return pokemon.name;
    }
    /* buscar la evolucion actual del pokemon */
    const originalEvolution = pokemon.evolutions.find((evolution) => {
        return evolution.name === pokemon.name;
    });
    /* si no hay evolucion actual, devolver el pokemon */
    if (!originalEvolution) {
        return pokemon.name;
    }
    /* buscar la posicion de la evolucion actual en el array de evoluciones */
    const originalEvolutionIndex = pokemon.evolutions.indexOf(originalEvolution);
    /* si no hay posicion, devolver el pokemon */
    if (originalEvolutionIndex === -1) {
        return pokemon.name;
    }
    /* coger la última evolucion del array */
    let evolution = lowerEvolutions[lowerEvolutions.length - 1];
    /* si la evolucion actual no es la ultima del array, coger la siguiente  a la actual*/
    if (originalEvolutionIndex < lowerEvolutions.length - 1) {
        evolution = lowerEvolutions[originalEvolutionIndex + 1];
    }
    return evolution.name;
    
}


export {
    isEvolving,
    getEvolutions,
    evolve,

}