import mongoose from 'mongoose'

const messageschema = new mongoose.Schema({
    sender:{
        type:String,
        required:true
    },
    receiver:{
        type:String,
        required:true
    },
    text:{
        type:String,
        required:true
    },
      read: {
      type: Boolean,
      default: false,
    }
},{
    timestamps: true
})


const message = mongoose.model("Message",messageschema)

export default message;