import Zone from "../../models/templates/zone.js";
import habitatController from "./habitatController.js";
import gymController from "../gymController.js";
import { getName } from "./utils.js";
const getZones = async () => {
    try {
        const zones = await Zone.find();
        const newZones = await Promise.all(zones.map(async (zone) => {
            await zone.populate("gym");

            const habitat = await habitatController.getHabitatFromDB(zone.habitat);
            //zone.habitat = habitat ? getName(habitat.names,"es") : zone.habitat;
            return zone;
        }))
        return newZones;
    } catch (error) {
        console.error(error);
        return { error }
    }
}
const getGymByZone = async (zoneName) => {
    try {
        const zone = await Zone.findOne({ name: zoneName });
        await zone.populate("gym");
        return zone.gym;
    } catch (error) {
        console.error(error);
        return { error }
    }
}
const getZone = async (name) => {
    try {
        const zone = await Zone.findOne({ name });
        const species = await getPokemonsByZone(name);
        const newZone  = {...zone._doc}
        const habitat = await habitatController.getHabitatFromDB(zone.habitat);
        newZone.gym = await gymController.getGym(newZone.gym);
        console.log("newZone",newZone,habitat);
        //newZone.habitat = getName(habitat.names,"es");
        if(!species.error){
            newZone.pokemon_species = species;
        }
        return newZone;
    } catch (error) {
        console.error(error);
        return { error }
    }
}
const getHabitat = async (name) => {
    try {
        const zone = await Zone.findOne({ name });
        const habitat = await habitatController.getHabitatFromDB(zone.habitat);
        return habitat;
    } catch (error) {
        console.error(error);
        return { error }
    }
}
const getPokemonsByZone = async (name) => {
    try {
        const habitat = await getHabitat(name);
        const pokemons = habitat.pokemon_species.map(pokemon => pokemon.name);
        return pokemons;
    } catch (error) {
        console.error(error);
        return { error }
    }
}

const getZonesByHabitat = async (habitat) => {
    try {
        const zones = await Zone.find({ habitat });
        return zones;
    } catch (error) {
        console.error(error);
        return { error }
    }
}

const createZone = async (data) => {
    try {
        const zone = new Zone(data);
        await zone.save();
        return zone;
    } catch (error) {
        console.error(error);
        return { error }
    }
}

const updateZone = async (name, data) => {
    try {
        const zone = await Zone.findOneAndUpdate({ name }, data, { new: true });
        return zone;
    } catch (error) {
        console.error(error);
        return { error }
    }
}
const deleteZone = async (name) => {
    try {
        const zone = await Zone.findOneAndDelete({ name });
        return zone;
    } catch (error) {
        console.error(error);
        return { error }
    }
}
export default {
    getZones,
    getZone,
    getGymByZone,
    getZonesByHabitat,
    getHabitat,
    getPokemonsByZone,
    createZone,
    updateZone,
    deleteZone
}