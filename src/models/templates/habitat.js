/**
 * @typedef {Object} Habitat
 * @property {String} name
 * @property {Array} pokemon_species
 * @property {Array} names
 * 
 */

import mongoose, { Schema } from "mongoose";

const habitatSchema = new Schema({
    name: String,
    pokemon_species: [],
    names: [{
        name: String,
        language: {
            name: String,
            url: String,
        },
    }],
});

const Habitat = mongoose.model('Habitat', habitatSchema);

export default Habitat;
