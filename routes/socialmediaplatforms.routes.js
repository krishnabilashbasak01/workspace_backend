const express = require('express');
const {getAllPlatforms, createPlatform, updatePlatform, deletePlatform, createPostType, updatePostType, deletePostType,
    getAllPostTypes, createContext, updateContext, deleteContext, getAllContexts,
    addPlatformToClient, removePlatformFromClient, addContextToPlatform, removeContextFromPlatform,
    createSocialMediaMetric, updateSocialMediaMetric, deleteSocialMediaMetric
} = require("../controllers/socialmediaplatform.controller");
const router = express.Router();

// Social media platforms
router.post('/', createPlatform);
router.get('/all', getAllPlatforms);
router.put('/:id', updatePlatform);
router.delete('/:id', deletePlatform);
router.post('/add-social-media-platforms', addPlatformToClient);
router.post('/remove-social-media-platforms', removePlatformFromClient);


// Social media PostTypes
router.post('/post-type', createPostType);
router.put('/post-type/:id', updatePostType);
router.delete('/post-type/:id', deletePostType);
router.get('/post-type/all', getAllPostTypes);

// Social Media Contexts
router.post('/context', createContext);
router.put('/context/:id', updateContext);
router.delete('/context/:id', deleteContext);
router.get('/context/all', getAllContexts);
router.post('/add-context-to-social-media', addContextToPlatform);
router.post('/remove-context-from-social-media', removeContextFromPlatform);

// Client Social Media Metrics
router.post('/metric', createSocialMediaMetric);
router.put('/metric', updateSocialMediaMetric);
router.delete('/metric/:id', deleteSocialMediaMetric);
router.get('/metric/:clientId/:socialMediaPlatformId/:')


// Export
module.exports = router;