/**
 * @typedef {Object} Trainer
 * @property {String} name
 * @property {String} nameEs
 * @property {String} sprite
 * @property {Array} pokemons
 * 
 */

import mongoose, { Schema } from "mongoose";

const trainerSchema = new Schema({
    name: String,
    sprite: String,
    pokemons: [{
        type: Schema.Types.ObjectId,
        ref: "PokemonTemplate"
    }],
});

const Trainer = mongoose.model('Trainer', trainerSchema);