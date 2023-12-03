import {getName} from "./utils.js";
import {fetchData} from "./utils.js";

const getTypesData = async (pokemon) => {
    const types = pokemon.types;
    
    const typesData = await Promise.all(types.map(async (type) => {
        const typeData = await getTypeData(type.type);
        return typeData;
    }));
    return typesData;
}
    
const getTypeData = async(type) =>{
    const url = type.url;
    const [error,data] = await fetchData(url);
    if(error){
        throw error;
    }
    return {
        name:data.name,
        nameEs: getName(data.names,"es"),
        double_damage_to:data.damage_relations.double_damage_to,
        half_damage_to:data.damage_relations.half_damage_to,
        no_damage_to:data.damage_relations.no_damage_to,
    }
}

export {
    getTypesData,
    getTypeData,
}