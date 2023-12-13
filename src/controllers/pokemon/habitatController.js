import Habitat from "../../models/templates/habitat.js";
import dotenv from 'dotenv';

dotenv.config();
const base_url = "https://pokeapi.co/api/v2/pokemon-habitat/";
const MAX_POKEMON = process.env.MAX_POKEMON || 151;

export const getHabitats = async (req, res) => {
    try {
        let habitats = await Habitat.find();
        if (habitats.length === 0) {
            await saveHabitats();
            habitats = await Habitat.find();
        }
        habitats = habitats.map((habitat) => {
            habitat.pokemon_species = filterByMaxPokemon(habitat.pokemon_species, MAX_POKEMON);
            return habitat;
        });
        res.status(200).json(habitats);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const fetchHabitat = async (name) => {
    try {
        const data = await fetch(`${base_url}${name}`);
        const habitat = await data.json();
        habitat.pokemon_species = habitat.pokemon_species.map((pokemon) => {
            return {
                name: pokemon.name,
                url: pokemon.url,
                id: pokemon.url.split('/')[6],
            }
        });
        return habitat;
    } catch (error) {
        return error;
    }
}

const fetchHabitats = async () => {
    try {
        const response = await fetch(`${base_url}`);
        const data = await response.json();
        const habitats = await Promise.all(data.results.map(async (habitat) => {
            const habitatRecord = await fetchHabitat(habitat.name);
            return habitatRecord;
        }));
        return habitats;
    } catch (error) {
        return error;
    }
}

const saveHabitats = async () => {
    try {
        const habitats = await fetchHabitats();
        habitats.forEach(async (habitat) => {
            const newHabitat = new Habitat(habitat);
            await newHabitat.save();
        });
    } catch (error) {
        return error;
    }
}

const filterByMaxPokemon = (pokemon_species, maxPokemon) => {
    return pokemon_species.filter((pokemon) => {
        return parseInt(pokemon.id) <= maxPokemon;
    });
}
export default {
    getHabitats,
}