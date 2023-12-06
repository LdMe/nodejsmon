/**
 * @typedef {Object} EvolutionChain
 * 
 */

import mongoose, { Schema } from "mongoose";

const evolutionChainSchema = new Schema({
    url: String,
    baby_trigger_item: Object,
    chain: Object,
}, { strict: false });

export default mongoose.model("EvolutionChain", evolutionChainSchema);