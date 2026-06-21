import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
    title : {
        type : String,
        required:true
    },
    content : {
        type : String,
        required:true,
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        required:true,
        ref : "User"
    }
},{ timestamps: true });

const Journal = mongoose.model("Journal",journalSchema);
export default Journal;