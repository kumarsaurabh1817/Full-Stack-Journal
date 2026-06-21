import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createJournal, deleteJournalById, getAllJournals, getJournalById, updateJournalById } from "../controllers/journalController.js";


const router = express.Router();
router.post("/",authMiddleware,createJournal);
router.get("/",authMiddleware,getAllJournals);
router.get("/:id",authMiddleware,getJournalById);
router.put("/:id",authMiddleware,updateJournalById);
router.delete("/:id",authMiddleware,deleteJournalById);

export default router;