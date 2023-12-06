import { fetchData } from "./utils.js";
import SpeciesTemplate from "../../models/templates/species.js";
const speciesUrl = 'https://pokeapi.co/api/v2/pokemon-species';
const getSpecies = async( pokemon )=>{
    const oldSpecies = await SpeciesTemplate.findOne({name:pokemon.species.name});
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


export {
    getSpecies,
}
