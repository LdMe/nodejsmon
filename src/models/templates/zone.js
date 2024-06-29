/**
 * @typedef {Object} Zone
 * @property {String} name
 * @property {String} habitat
 * @property {Number} minLevel
 * @property {Number} maxLevel
 * 
 */

import mongoose, { Schema } from "mongoose";

const zoneSchema = new Schema({
    name: String,
    habitat:String,
    pokemon_species: [],
    gym: { type: Schema.Types.ObjectId, ref: 'Gym' },
});

const Zone = mongoose.model('Zone', zoneSchema);

export default Zone;
