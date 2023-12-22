/**
 * Modelo para guardar los datos de los gimnasios
 * cada gimnasio tiene un lider (un array de plantillas de pokemons), un campeón (el último jugador que ganó el gimnasio) y un nivel máximo para los pokemons que se pueden usar en el gimnasio
 */

import mongoose, { Schema } from "mongoose";

const gymSchema = new Schema({
    name: String,
    leaderPokemons: [
        {
        level: Number,
        _id: {
            type: Schema.Types.ObjectId,
            ref: "PokemonTemplate",
        },
        }
    ],
    championPokemons: [
        {
            type: Schema.Types.ObjectId,
            ref: "Pokemon",
        },
    ],
    badge: {
        type: Schema.Types.ObjectId,
        ref: "Badge",
    },
    maxLevel: Number,
});

const Gym = mongoose.model("Gym", gymSchema);

export default Gym;