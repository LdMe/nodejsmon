/**
 * @typedef {Object} Move
 * @property {String} name
 * @property {Number} accuracy
 * @property {Object} contest_combos
 * @property {Object} contest_effect
 * @property {Object} contest_type
 * @property {Object} damage_class
 * @property {Number} effect_chance
 * @property {Array} effect_changes
 * @property {Array} effect_entries
 * @property {Array} flavor_text_entries
 * @property {Object} generation
 * @property {Array} learned_by_pokemon
 * @property {Array} machines
 * @property {Object} meta
 * @property {Array} names
 * @property {Array} past_values
 * @property {Number} power
 * @property {Number} pp
 * @property {Number} priority
 * @property {Array} stat_changes
 * @property {Object} super_contest_effect
 * @property {Object} target
 * @property {Object} type
 */

import mongoose, { Schema } from "mongoose";

const moveSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    accuracy: Number,
    damage_class: {
        name: String,
        url: String,
    },
    effect_chance: Number,
    effect_changes: [{
        effect_entries: [{
            effect: String,
            language: {
                name: String,
                url: String,
            },
        }],
        version_group: {
            name: String,
            url: String,
        },
    }],
    generation: {
        name: String,
        url: String,
    },
    learned_by_pokemon: [{
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
    power: Number,
    pp: Number,
    priority: Number,
    stat_changes: [{
        change: Number,
        stat: {
            name: String,
            url: String,
        },
    }],
    target: {
        name: String,
        url: String,
    },
    type: {
        type:Schema.Types.ObjectId,
        ref:"Type",
    },
},{strict:true});

moveSchema.pre('find', function() {
    this.populate('type');
}).pre('findOne', function() {
    this.populate('type');
});

export default mongoose.model("Move", moveSchema);


