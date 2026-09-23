import mongoose from "mongoose";

const userschema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique : true
    },
    hashedPass: {
        type : String,
        required : true,

    },
    profileImage: {
        type: String,
        default: ""
    }

})

const User = mongoose.model("User",userschema);

export default User;