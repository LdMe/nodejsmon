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
    activeMoves: [{
        type: Schema.Types.ObjectId,
        ref: "Move",
    }],
    moves: Array,
    level: Number,
    hp: Number,
    maxHp: Number,
    id: Number,
    evolutions: Array,
    stats: Array,
    shiny: Boolean,
    species: Object,
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

pokemonSchema.pre("find",  function () {
     this.populate("activeMoves");
    /* for(const move of this.activeMoves){
        await move.populate("type");
    } */
}).pre("findOne",  function () {
     this.populate("activeMoves");
    
})

const Pokemon = mongoose.model('Pokemon', pokemonSchema);

export default Pokemon;
