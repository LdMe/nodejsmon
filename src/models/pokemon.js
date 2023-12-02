/*
Modelo para guardar los datos de los pokemones
datos minimos:
baseHp
name
sprites
types
moves
level
hp
maxHp
id
uniqueId

*/

import mongoose,{Schema} from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const pokemonSchema = new Schema({
    baseHp: Number,
    name: String,
    sprites: Object,
    types: Array,
    activeMoves: Array,
    moves: Array,
    level: Number,
    hp: Number,
    maxHp: Number,
    id: Number,
    evolutions: Array,
    shiny: Boolean,
});

const Pokemon = mongoose.model('Pokemon', pokemonSchema);

export default Pokemon;
