const express = require('express');
const { getAllPackages, createPackage, updatePackage, deletePackage , activePackage, inactivePackage} = require('../controllers/package.controller');
const router = express.Router();

// Package
router.get('/all', getAllPackages);
router.post('/', createPackage);
router.put('/:id', updatePackage);
router.delete('/:id', deletePackage);

// Client Packages
router.post('/active-package', activePackage);
router.get('/inactive-package/:id', inactivePackage);


module.exports = router;