import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
    },
    password:
    {
        type: String,
    },
    pokemons:
        [
            {
                type: Schema.Types.ObjectId,
                ref: "Pokemon"
            }
        ],
    savedPokemons:
        [
            {
                type: Schema.Types.ObjectId,
                ref: "Pokemon"
            }
        ],
    enemies: [

        {
            type: Schema.Types.ObjectId,
            ref: "Pokemon"
        },
    ],
    role: {
        type: String,
        default: "user"
    },
    isConnected: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    activeTime: {
        type: Number,
        default: 0
    },
    loginCount: {
        type: Number,
        default: 0
    },
    maxLevel: {
        type: Number,
        default: 10
    },
    seenPokemons: {
        type: Array,
        default: []
    },
    capturedPokemons: {
        type: Array,
        default: []
    },
    zone: {
        type: String,
        default: 'Llanuras Doradas'
    },
    ironMan: {
        type: Boolean,
        default: false
    },
    hardcore: {
        type: Boolean,
        default: false
    }
}, { strict: false });

userSchema.pre("save", function () {
    if(this.zone === null){
        this.zone = 'Llanuras Doradas';
    }
})
const User = mongoose.model('User', userSchema);

export default User;