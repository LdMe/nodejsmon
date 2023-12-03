import { fetchData } from "./utils.js";
const getSpecies = async( pokemon )=>{
    const speciesUrl = pokemon.species.url;
    const [error,data] = await fetchData(speciesUrl);
    if(error){
        throw error;
    }
    return data;
}


export {
    getSpecies,
}
