const express = require('express');
const {createClient, getClients, getClient, updateClient, deleteClient, getClientByUserName, addSmeToClient} = require("../controllers/client.controller");
const router = express.Router();
const {authMiddleware} = require("../middlewares/auth.middleware");


router.post('/', createClient); // Create client
router.get('/all', authMiddleware, getClients); // Get all clients
router.get('/:id', getClient); // Get client by id
router.put('/:id', updateClient); // Update client by id
router.delete('/:id', deleteClient); // Delete client by id
router.get('/username/:username', getClientByUserName); // Get client by id
router.post('/add-sme-to-client', addSmeToClient);



// Export Router
module.exports = router;