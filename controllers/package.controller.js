const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();


exports.createPackage = async (req, res) => {
    const {name,description, status} = req.body;
    try{
        const package = await prisma.package.create({
            data: {
                name,
                description,
                status,
            }
        })
        res.status(200).send(package);
    }catch(error){
        res.status(500).send({error: error.message});
    }
}

// Update Package
exports.updatePackage = async (req, res) => {
    const {id} = req.params;
    const {name, description, status} = req.body;
    try{
        const package = await prisma.package.update({
            where: {id: Number(id)},
            data:{
                name,
                description,
                status
            }
        })
        res.status(200).send(package);
    }catch (error) {
        res.status(500).send({error: error.message});
    }
}

// Delete Package
exports.deletePackage = async (req, res) => {
    const {id} = req.params;
    try{
        await prisma.package.delete({
            where: {id: Number(id)},
        })
        res.status(200).send({message: 'Package has been deleted successfully.'});
    }catch (error) {
        res.status(500).send({error: error.message});
    }
}

// Get All Packages
exports.getAllPackages = async (req, res) => {
    try{
        const packages = await prisma.package.findMany();
        res.status(200).send(packages);
    }catch (error) {
        res.status(500).send({error: error.message});
    }
}


// Package active for client
exports.activePackage = async (req, res) => {
    const {packageId, clientId} = req.body;
    try{
        const package = await prisma.clientPackage.create({data: {
            packageId: Number(packageId),
            clientId: Number(clientId),
            activationDate: new Date(),
        }});

        res.status(200).send(package);
    }catch(error){
        res.status(500).send({error: error.message});
    }
}

// Package Inactive for client
exports.inactivePackage = async (req, res) => {
    const {id} = req.params;
    try{
        const package = await prisma.clientPackage.update({
            where: {id: Number(id)},
            data: {
                deactivationDate: new Date(),
                status: false
            }
        });
        res.status(200).send(package);
    }catch(error){
        res.status(500).send({error: error.message});
    }
}

