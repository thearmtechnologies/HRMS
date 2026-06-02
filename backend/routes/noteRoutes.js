const express = require('express');
const router = express.Router();
const {
    addNote,
    editNote,
    getAllNotes,
    deleteNoteById,
    updateNotePinned,
    searchNotes,
} = require('../controllers/noteController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, addNote);
router.put('/:noteId/user/:userId', authenticate, editNote);
router.get('/user/:userId', authenticate, getAllNotes);
router.delete('/:noteId/user/:userId', authenticate, deleteNoteById);
router.patch('/:noteId/user/:userId/pin', authenticate, updateNotePinned);
router.get('/user/:userId/search', authenticate, searchNotes);

module.exports = router;
