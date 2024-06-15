
import mongoose, { Schema } from "mongoose";

const pokemonShortSchema = new Schema({
    name: String,
    sprites:{
        front_default: String,
        back_default: String,
        front_shiny: String,
        back_shiny: String
    },
    stats: [],
    abilities: [],
    activeMoves: [],
    moves: [],
    id: String,
    types: [],

}, { strict: false });

const PokemonShort = mongoose.model("PokemonShort", pokemonShortSchema);

export default PokemonShort;

