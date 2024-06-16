import GymModel from '../models/gym.js';
//import {getPokemonTemplateFromDb} from '../controllers/pokemon/pokemonController.js';
import { fetchPokemon } from './pokemon/pokemonController.js';
const getAllGyms = async () => {
    try {

        const gyms = await GymModel.find();

        const newGyms = await Promise.all(gyms.map(async (gym) => {
            const gymData = await getGymData(gym.toObject());
            return gymData;
        }));
        return newGyms;
    }
    catch (error) {
        console.error(error);
        return [];
    }
}
const getGymData = async (gym) => {
    const newGym = { ...gym };
    newGym.trainers = await Promise.all(newGym.trainers.filter(trainer => trainer).map((trainer) => getTrainerData(trainer)));
    return newGym;
}
const getTrainerData = async (trainer) => {
    const newTrainer = { ...trainer };
    newTrainer.pokemons = await getPokemonsData(trainer);
    return newTrainer;
}
const getPokemonsData = async (trainer) => {
    console.log("pokemon triner", trainer);
    const pokemons = await Promise.all(trainer.pokemons.map((pokemon) => fetchPokemon(pokemon.name)));
    return pokemons.map((pokemon) => {
        console.log("trainer", trainer.pokemons);
        const newPokemon = { ...pokemon._doc };
        newPokemon.level = trainer.pokemons.find((p) => p.name === pokemon.name).level;
        console.log("pokemon", newPokemon);
        return newPokemon;
    });
}
const getGym = async (id) => {
    try {
        const gym = await GymModel.findById(id);
        const newGym = await getGymData(gym);
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
            return { error: "gimnasio ya existe" };
        }
        const newGym = new GymModel(gym);
        await newGym.save();
        return newGym;
    }
    catch (error) {
        console.error(error);
        return { error: "error al crear gimnasio" };
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
