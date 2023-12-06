import {getName} from "./utils.js";
import {fetchData} from "./utils.js";
import TypeTemplate from "../../models/templates/type.js";
const typeUrl = 'https://pokeapi.co/api/v2/type';
const getTypesData = async (pokemon) => {
    const types = pokemon.types;
    const typesData = await Promise.all(types.map(async (type) => {
        const typeData = await getTypeData(type.type);
        return typeData;
    }));
    return typesData;
}
    
const getTypeData = async(type) =>{
    const existingType = await TypeTemplate.findOne({name:type.name});
    if(existingType){
        const typeData = {
            name:existingType.name,
            nameEs: getName(existingType.names,"es"),
            double_damage_to:existingType.damage_relations.double_damage_to,
            half_damage_to:existingType.damage_relations.half_damage_to,
            no_damage_to:existingType.damage_relations.no_damage_to,
        }
        return typeData;
    }
    const url = `${typeUrl}/${type.name}`;
    const [error,data] = await fetchData(url);
    if(error){
        throw error;
    }
    const typeData = new TypeTemplate(data);
    await typeData.save();
    return {
        name:typeData.name,
        nameEs: getName(typeData.names,"es"),
        double_damage_to:typeData.damage_relations.double_damage_to,
        half_damage_to:typeData.damage_relations.half_damage_to,
        no_damage_to:typeData.damage_relations.no_damage_to,
    }
}

export {
    getTypesData,
    getTypeData,
}