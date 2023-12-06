import mongoose,{ Schema } from "mongoose";

const userSchema = new Schema({
    username:{
        type:String,
        unique:true,
    },
    password:
    {
        type:String,
    },
    pokemons:
    [
        {
            type: Schema.Types.ObjectId,
            ref: "Pokemon"
        }
    ],
    enemy:
    {
        type: Schema.Types.ObjectId,
        ref: "Pokemon"
    },
},{ strict: false });

const User = mongoose.model('User', userSchema);

export default User;