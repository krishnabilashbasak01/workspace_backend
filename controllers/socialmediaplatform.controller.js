const {PrismaClient} = require('@prisma/client');
const error = require("jsonwebtoken/lib/JsonWebTokenError");
const prisma = new PrismaClient();

// Platform
// Create platform
const createPlatform = async (req, res) => {
    const {name, icon, status} = req.body;
    try {
        const platform = await prisma.socialMediaPlatform.create({
            data: {
                name,
                icon,
                status,
            }
        })

        res.status(201).send(platform);
    } catch (error) {
        res.status(500).send({error: error.message});
    }
}

// Get All Social Medial Platforms
const getAllPlatforms = async (req, res) => {
    try {
        const platforms = await prisma.socialMediaPlatform.findMany({
            include: {
                contexts: true
            }
        });
        res.status(200).send(platforms);
    } catch (error) {
        res.status(500).send({error: error.message});
    }
}

// Update a platform
const updatePlatform = async (req, res) => {
    const {id} = req.params;
    const {name, icon, status} = req.body;

    try {
        const platform = await prisma.socialMediaPlatform.update({
            where: {id: Number(id)},
            data: {
                name,
                icon,
                status,
            }
        })
        res.status(200).send(platform);
    } catch (error) {
        res.status(500).send({error: error.message});
    }
}

// Delete a platform
const deletePlatform = async (req, res) => {
    const {id} = req.params;
    try {
        await prisma.socialMediaPlatform.delete({
            where: {id: Number(id)},
        })

        res.status(200).send({message: 'Platform deleted successfully'});
    } catch (error) {
        res.status(500).send({error: error.message});
    }
}

// add platform to client
const addPlatformToClient = async (req, res) => {
    const {clientId, platformId} = req.body;
    try {
        let client = await prisma.client.update({
            where: {id: Number(clientId)},
            data: {
                platforms: {
                    connect: {id: platformId}
                }
            }
        })

        res.status(200).send({message: "Platform added successfully", client})
    } catch (error) {
        res.status(200).send({error: "Failed to add platform to client"})
    }
}

const removePlatformFromClient = async (req, res) => {
    const {clientId, platformId} = req.body;

    try {
        let client = await prisma.client.update({
            where: {id: Number(clientId)},
            data: {
                platforms: {
                    disconnect: {id: platformId}
                }
            }
        })
        res.status(200).send({message: "Platform deleted successfully"})

    } catch (error) {
        res.status(200).send({error: "Failed to add platform to client"})

    }
}


// Post Type
const createPostType = async (req, res) => {
    const {name, status} = req.body;
    try {
        const postType = await prisma.postType.create({
            data: {
                name, status
            }
        })
        res.status(201).send(postType);
    } catch (error) {
        res.status(500).send({error: error.message});
    }
}

// Update PostType
const updatePostType = async (req, res) => {
    const {id} = req.params;
    const {name, status} = req.body;
    try {
        const postType = await prisma.postType.update({
            where: {id: Number(id)},
            data: {
                name,
                status
            }
        })
        res.status(200).send(postType);
    } catch (error) {
        res.status(500).send({error: error.message});
    }
}

// Delete PostType
const deletePostType = async (req, res) => {
    const {id} = req.params;
    try {
        await prisma.postType.delete({
            where: {id: Number(id)},
        })
        res.status(200).send({message: 'Post Type has been deleted successfully.'});
    } catch (error) {
        res.status(500).send({error: error.message});
    }
}

// Get all Post Type
const getAllPostTypes = async (req, res) => {
    try {
        const postTypes = await prisma.postType.findMany();
        res.status(200).send(postTypes);
    } catch (error) {
        res.status(500).send({error: error.message});
    }
}

// Social Media Context

// Crate social media context
const createContext = async (req, res) => {
    const {name, status} = req.body;

    try {
        const context = await prisma.socialMediaContext.create({
            data: {
                name,
                status,
            }
        })
        res.status(200).send(context);
    } catch (error) {
        res.status(500).send({error: error.message});
    }
}

// update social media context
const updateContext = async (req, res) => {
    const {id} = req.params;
    const {name, status} = req.body;
    try {
        const context = await prisma.socialMediaContext.update({
            where: {id: Number(id)},
            data: {
                name,
                status,
            }
        });
        res.status(200).send(context);
    } catch (error) {
        res.status(500).send({error: error.message});
    }
}

// delete social media context
const deleteContext = async (req, res) => {
    const {id} = req.params;
    try {
        await prisma.socialMediaContext.delete({
            where: {id: Number(id)},
        })
        res.status(200).send({message: 'Social Media Context Deleted successfully'});
    } catch (error) {
        res.status(500).send({error: error.message});
    }
}

// get al social media contexts
const getAllContexts = async (req, res) => {
    try {
        const contexts = await prisma.socialMediaContext.findMany();
        res.status(200).send(contexts);
    } catch (error) {
        res.status(500).send({error: error.message});
    }
}


//  Add context to platform
const addContextToPlatform = async (req, res) => {
    const {platformId, contextId} = req.body;
    try {
        const updatedPlatform = await prisma.socialMediaPlatform.update({
            where: {id: Number(platformId)},
            data: {
                contexts: {
                    connect: {id: Number(contextId)}
                }
            }
        })
        res.status(200).send(updatedPlatform);
    } catch (e) {
        res.status(500).send({error: e.message});
    }
}

// remove context from platform
const removeContextFromPlatform = async (req, res) => {
    const {platformId, contextId} = req.body;
    try {
        let updatedPlatform = await prisma.socialMediaPlatform.update({
            where: {id: Number(platformId)},
            data: {
                contexts: {
                    disconnect: {id: Number(contextId)}
                }
            }
        })
        res.status(200).send(updatedPlatform);
    } catch (e) {
        console.log(error.message);
        res.status(500).send({error: error.message});
    }
}


// Social media metrics

// create social medial metrics
const createSocialMediaMetric = async (req, res) => {
    try {
        const {clientId, socialMediaPlatformId, contextId, date, metricType, value} = req.body;

        let metric = await prisma.socialMediaMetrics.create({
            data: {
                clientId,
                socialMediaPlatformId,
                contextId,
                date: new Date(date),
                metricType,
                value
            }
        })
        res.status(201).send(metric);
    } catch (error) {

        res.status(500).send({error: error.message});
    }
}

// Update social media metrics
const updateSocialMediaMetric = async (req, res) => {
    try {
        const {metricId, value} = req.body;
        let metric = await  prisma.socialMediaMetrics.update({
            where: {id: Number(metricId)},
            data:{
                value: value
            }
        })
        res.status(200).send(metric);
    } catch (error) {
        res.status(500).send({error: error.message});
    }
}


// Delete social media metrics
const deleteSocialMediaMetric = async (req, res) => {
    const {id} = req.params;
    try{

        await prisma.socialMediaMetrics.delete({
            where: {id: Number(id)},
        })
        res.status(200).send({message: 'Social Media Metric Deleted successfully'});
    }catch (e) {
        res.status(500).send({error: e.message});
    }
}


// exports all
module.exports = {
    createPlatform,
    getAllPlatforms,
    updatePlatform,
    deletePlatform,
    createPostType,
    updatePostType,
    deletePostType,
    getAllPostTypes,
    createContext,
    updateContext,
    deleteContext,
    getAllContexts,
    addPlatformToClient,
    removePlatformFromClient,
    addContextToPlatform,
    removeContextFromPlatform,
    createSocialMediaMetric,
    updateSocialMediaMetric,
    deleteSocialMediaMetric
}