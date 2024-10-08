/**
 * @typedef {Object} Species
 * @property {String} name
 * @property {Number} base_happiness
 * @property {Number} capture_rate
 * @property {Object} color
 * @property {Array} egg_groups
 * @property {Object} evolution_chain
 * @property {Object} evolves_from_species
 * @property {Array} flavor_text_entries
 * @property {Number} gender_rate
 * @property {Array} genera
 * @property {Object} generation
 * @property {Object} growth_rate
 * @property {Object} habitat
 * @property {Boolean} has_gender_differences
 * @property {Number} hatch_counter
 * @property {Boolean} is_baby
 * @property {Boolean} is_legendary
 * @property {Boolean} is_mythical
 * @property {Array} names
 * @property {Number} order
 * @property {Array} pal_park_encounters
 * @property {Array} pokedex_numbers
 */

import mongoose, { Schema } from "mongoose";

const speciesSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    base_happiness: Number,
    capture_rate: Number,
    color: {
        name: String,
        url: String,
    },
    egg_groups: [{
        name: String,
        url: String,
    }],
    evolution_chain: {
        url: String,
    },
    evolves_from_species: {
        name: String,
        url: String,
    },
    gender_rate: Number,
    generation: {
        name: String,
        url: String,
    },
    growth_rate: {
        name: String,
        url: String,
    },
    habitat: String,
    has_gender_differences: Boolean,
    hatch_counter: Number,
    is_baby: Boolean,
    is_legendary: Boolean,
    is_mythical: Boolean,
    names: [{
        language: {
            name: String,
            url: String,
        },
        name: String,
    }],
    order: Number,
    id:Number
 

},{strict:true});

const Species = mongoose.model('Species', speciesSchema);

export default Species;