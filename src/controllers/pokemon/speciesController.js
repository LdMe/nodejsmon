import { fetchData } from "./utils.js";
import SpeciesTemplate from "../../models/templates/species.js";
const speciesUrl = 'https://pokeapi.co/api/v2/pokemon-species';
const getSpecies = async (pokemonId) => {
    const oldSpecies = await SpeciesTemplate.findOne({ id: pokemonId });
    if (oldSpecies) {
        return oldSpecies;
    }
    const url = speciesUrl + `/${pokemonId}`;
    const [error, data] = await fetchData(url);
    if (error) {
        throw error;
    }
    try {
        data.habitat = data.habitat.name;
        const species = new SpeciesTemplate(data);
        species.save();
        return data;
    } catch (error) {
        throw error;
    }
}
const getFilteredSpecies = async (filter) => {
    const species = await SpeciesTemplate.find(filter);
    return species;
}

export {
    getSpecies,
    getFilteredSpecies
}

export default {
    getSpecies,
    getFilteredSpecies
}
