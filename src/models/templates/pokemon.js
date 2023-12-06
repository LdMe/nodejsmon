/**
 * @typedef {Object} PokemonTemplate
 * @property {String} name
 * 
 */

import mongoose, { Schema } from "mongoose";

const pokemonTemplateSchema = new Schema({
    name: String,
    id: String,
    abilities: [{
        ability: {
            name: String,
            url: String,
        },
        is_hidden: Boolean,
        slot: Number,
    }],
    base_experience: Number,
    forms: [{
        name: String,
        url: String,
    }],
    game_indices: [{
        game_index: Number,
        version: {
            name: String,
            url: String,
        },
    }],
    height: Number,
    held_items: [{
        item: {
            name: String,
            url: String,
        },
        version_details: [{
            rarity: Number,
            version: {
                name: String,
                url: String,
            },
        }],
    }],
    is_default: Boolean,
    location_area_encounters: String,
    moves: [{
        move: {
            name: String,
            url: String,
        },
        version_group_details: [{
            level_learned_at: Number,
            move_learn_method: {
                name: String,
                url: String,
            },
            version_group: {
                name: String,
                url: String,
            },
        }],
    }],
    order: Number,
    species: {
        name: String,
        url: String,
    },
    sprites: {
        back_default: String,
        back_female: String,
        back_shiny: String,
        back_shiny_female: String,
        front_default: String,
        front_female: String,
        front_shiny: String,
        front_shiny_female: String,
        versions: Object,
        other: Object,
    },
    stats: [{
        base_stat: Number,
        multiplier: Number,
        effort: Number,
        stat: {
            name: String,
            url: String,
        },
    }],
    types: [{
        slot: Number,
        type: {
            name: String,
            url: String,
        },
    }],
}, { strict: false });

const PokemonTemplate = mongoose.model("PokemonTemplate", pokemonTemplateSchema);

export default PokemonTemplate;

