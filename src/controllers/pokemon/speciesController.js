import { fetchData } from "./utils.js";
import SpeciesTemplate from "../../models/templates/species.js";
const speciesUrl = 'https://pokeapi.co/api/v2/pokemon-species';
const getSpecies = async( pokemon )=>{
    const name = pokemon.species.name || pokemon.name;
    const oldSpecies = await SpeciesTemplate.findOne({name});
    if(oldSpecies){
        return oldSpecies;
    }
    const url = speciesUrl + `/${pokemon.species.name}`;
    const [error,data] = await fetchData(url);
    if(error){
        throw error;
    }
    const species = new SpeciesTemplate(data);
    species.save();
    return data;
}
const getFilteredSpecies = async (filter) => {
    const species = await SpeciesTemplate.find(filter);
    return species;
}

export {
    getSpecies,
    getFilteredSpecies
}
