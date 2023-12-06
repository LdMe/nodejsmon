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
    name: String,
    accuracy: Number,
    contest_combos: {
        normal: {
            use_after: [{
                name: String,
                url: String,
            }],
            use_before: [{
                name: String,
                url: String,
            }],
        },
        super: {
            use_after: [{
                name: String,
                url: String,
            }],
            use_before: [{
                name: String,
                url: String,
            }],
        },
    },
    contest_effect: {
        url: String,
    },
    contest_type: {
        name: String,
        url: String,
    },

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
    effect_entries: [{
        effect: String,
        language: {
            name: String,
            url: String,
        },
    }],
    flavor_text_entries: [{
        flavor_text: String,
        language: {
            name: String,
            url: String,
        },
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
    machines: [{
        machine: {
            name: String,
            url: String,
        },
        version_group: {
            name: String,
            url: String,
        },
    }],
    meta: {
        ailment: {
            name: String,
            url: String,
        },
        ailment_chance: Number,
        category: {
            name: String,
            url: String,
        },
        crit_rate: Number,
        drain: Number,
        flinch_chance: Number,
        healing: Number,
        max_hits: Number,
        max_turns: Number,
        min_hits: Number,
        min_turns: Number,
        stat_chance: Number,
    },
    names: [{
        language: {
            name: String,
            url: String,
        },
        name: String,
    }],
    past_values: [{
        accuracy: Number,
        effect_chance: Number,
        effect_entries: [{
            effect: String,
            language: {
                name: String,
                url: String,
            },
        }],
        power: Number,
        pp: Number,
        type: {
            name: String,
            url: String,
        },
        version_group: {
            name: String,
            url: String,
        },
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
    super_contest_effect: {
        url: String,
    },
    target: {
        name: String,
        url: String,
    },
    type: {
        name: String,
        url: String,
    },
},{strict:true});

export default mongoose.model("Move", moveSchema);


