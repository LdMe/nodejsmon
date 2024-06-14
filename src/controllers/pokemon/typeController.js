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
const getTypesFromDB = async () => {
    const types = await TypeTemplate.find();
    return types;
}
const getReducedTypeData = type => {
    let typeData = type.type || type;
    return {
        _id: typeData._id,
        name: typeData.name,
        damage_relations: typeData.damage_relations,
        names: typeData.names,
    }
}
    
const getTypeData = async(type) =>{
    const existingType = await TypeTemplate.findOne({name:type.name});
    if(existingType){
        return existingType;
    }
    const url = `${typeUrl}/${type.name}`;
    const [error,data] = await fetchData(url);
    if(error){
        throw error;
    }
    const typeData = new TypeTemplate(data);
    await typeData.save();
    return typeData;
}

export {
    getTypesData,
    getTypeData,
    getReducedTypeData,
    getTypesFromDB
}
export default {
    getTypesData,
    getTypeData,
    getReducedTypeData,
    getTypesFromDB

}