

/**
 * @typedef {Object} Type
 * @property {String} name
 * @property {String} nameEs
 * @property {Object} damage_relations
 * @property {Array} game_indices
 * @property {Object} generation
 * @property {Object} move_damage_class
 * @property {Array} moves
 * @property {Array} names
 * @property {Array} pokemon
 * 
 */

import mongoose, { Schema } from "mongoose";

const typeSchema = new Schema({
    name: String,
    nameEs: String,
    damage_relations: {
        double_damage_from: [{
            name: String,
            url: String,
        }],
        double_damage_to: [{
            name: String,
            url: String,
        }],
        half_damage_from: [{
            name: String,
            url: String,
        }],
        half_damage_to: [{
            name: String,
            url: String,
        }],
        no_damage_from: [{
            name: String,
            url: String,
        }],
        no_damage_to: [{
            name: String,
            url: String,
        }],
    },
    game_indices: [{
        game_index: Number,
        generation: {
            name: String,
            url: String,
        },
    }],
    generation: {
        name: String,
        url: String,
    },
    move_damage_class: {
        name: String,
        url: String,
    },
    moves: [{
        name: String,
        url: String,
    }],
    names: [{
        language: {
            name: String,
            url: String,
        },
        name: String,
    }],
    pokemon: [{
        pokemon: {
            name: String,
            url: String,
        },
        slot: Number,
    }],


},{strict:true});

const Type = mongoose.model("Type", typeSchema);

export default Type;
