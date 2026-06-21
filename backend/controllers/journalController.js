import Journal from "../models/journalModel.js";

export const createJournal = async (req,res) => {
    try{
        const {title,content} = req.body;
        const userId = req.user.userId;

        if(!title || !content){
            return res.status(400).json({
                success : false,
                message : "All fields are required."
            })
        }

        // title and content validations
        if(title.length < 2 || title.length > 100){
            return res.status(400).json({
                success : false,
                message : "Title must be between 2 and 100 characters."
            })
        }

        if(content.length < 10 || content.length > 1000){
            return res.status(400).json({
                success : false,
                message : "Content must be between 10 and 1000 characters."
            })
        }

        const journal = await Journal.create({title,content,userId});
        return res.status(201).json({
            success : true,
            message : "Journal created successfully.",
            data : journal
        })
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Internal server error.",
        })
    }
}

export const getAllJournals = async (req,res) => {
    try{
        const userId = req.user.userId;

        const allJournals = await Journal.find({userId : userId});

        return res.status(200).json({
            success : true,
            message : "Journals fetched successfully.",
            data : allJournals
        })
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Internal server error.",
        })
    }
}

export const getJournalById = async (req,res) => {
    try{
        const journalId = req.params.id;
        if(!journalId){
            return res.status(400).json({
                success : false,
                message : "Invalid journal Id"
            })
        }

        const journal = await Journal.findOne({
            _id : journalId,
            userId : req.user.userId
        })

        if(!journal){
            return res.status(404).json({
                success : false,
                message : "Invalid journal id or journal not found"
            })
        }
        return res.status(200).json({
            success:true,
            message : "Journal Fetched by Id",
            data : journal
        })
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Internal server error.",
        })
    }
}

export const updateJournalById = async (req,res) => {
    try{
        const journalId = req.params.id;
        const {title,content} = req.body;
        const userId = req.user.userId;
        if(!journalId){
            return res.status(400).json({
                success : false,
                message : "Invalid journal Id"
            })
        }
        if(!title || !content){
            return res.status(400).json({
                success : false,
                message : "All fields are required."
            })
        }

        // title and content validations
        if(title.length < 2 || title.length > 100){
            return res.status(400).json({
                success : false,
                message : "Title must be between 2 and 100 characters."
            })
        }

        if(content.length < 10 || content.length > 1000){
            return res.status(400).json({
                success : false,
                message : "Content must be between 10 and 1000 characters."
            })
        }
        const updatedJournal = await Journal.findOneAndUpdate(
            {
                _id : journalId,
                userId : userId
            },
            {
                title : title,
                content : content
            },
            {new: true,}
        )

        if(!updatedJournal){
            return res.status(404).json({
                success : false,
                message : "Invalid journal"
            })
        }

        return res.status(200).json({
            success:true,
            message : "Journal Updated by Id",
            data : updatedJournal
        })
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Internal server error.",
        })
    }
}

export const deleteJournalById = async (req,res) => {
    try{
        const journalId = req.params.id;
        const userId = req.user.userId;
        if(!journalId){
            return res.status(400).json({
                success : false,
                message : "Invalid journal Id"
            })
        }
        
        const deletedJournal = await Journal.findOneAndDelete(
            {
                _id : journalId,
                userId : userId
            }
        )
        if(!deletedJournal){
            return res.status(404).json({
                success : false,
                message : "Journal not found"
            })
        }
        return res.status(200).json({
            success:true,
            message : "Journal deleted",
            data : deletedJournal
        })
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Internal server error.",
        })
    }
}