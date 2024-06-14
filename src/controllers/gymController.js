import GymModel from '../models/gym.js';
import {getPokemonTemplatesFromDb} from '../controllers/pokemon/pokemonController.js';
const getAllGyms = async () => {
    try {
        const gyms = await GymModel.find();
        const newGyms = await Promise.all(gyms.map((gym) => {
           return  getPokemonsData(gym);
        }));
        return newGyms;
    }
    catch (error) {
        console.error(error);
        return [];
    }
}
const getPokemonsData =async (gym) => {
    const ids = gym.leaderPokemons.map((pokemon) => pokemon._id);
    const pokemons = await getPokemonTemplatesFromDb(ids);
    console.log("pokemons", pokemons);
    const newGym = gym.toObject();
    newGym.leaderPokemons = pokemons;
    gym.leaderPokemons.forEach((pokemon) => {
        const index = newGym.leaderPokemons.findIndex((p) => p._id.equals(pokemon._id));
        newGym.leaderPokemons[index].level = pokemon.level;
    });
    return newGym;
}
const getGym = async (id) => {
    try {
        const gym = await GymModel.findById(id);
        return gym;
    }
    catch (error) {
        console.error(error);
        return {};
    }
}

const createGym = async (gym) => {
    try {
        const oldGym = await GymModel.findOne({ name: gym.name });
        if (oldGym) {
            return {error:"gimnasio ya existe"};
        }
        const newGym = new GymModel(gym);
        await newGym.save();
        return newGym;
    }
    catch (error) {
        console.error(error);
        return {error:"error al crear gimnasio"};
    }
}   

const updateGym = async (id, gym) => {
    try {
        const updatedGym = await GymModel.findByIdAndUpdate(id, gym);
        return updatedGym;
    }
    catch (error) {
        console.error(error);
        return {};
    }
}

const deleteGym = async (id) => {
    try {
        const deletedGym = await GymModel.findByIdAndDelete(id);
        return deletedGym;
    }
    catch (error) {
        console.error(error);
        return {};
    }
}

export default {
    getAllGyms,
    getGym,
    createGym,
    updateGym,
    deleteGym,
}
