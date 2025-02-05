const bcrypt = require("bcrypt");
const axios = require('axios');
const mongoose = require("mongoose");

const  User = require('../models/User');

exports.createUserProfile = async (req, res) => {
    try{
        const {username, password, role} = req.body;
        const userExists = await User.findOne({username: username});
        if(userExists) return res.status(400).json({message: 'User already exists'});

        const newUser = new User({username, password, role});
        await newUser.save();
        res.status(201).json(newUser);
    }catch (error) {
        res.status(500).send({error: error.message});
    }
}

exports.updateUserProfile = async (req, res) => {
    try{
        const {name, username, email, isActive, head = false, profilePicture = '' } = req.body;
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).send({message: 'User does not exist'});


        user.name = name;
        user.username = username;
        user.email = email;
        user.username = username;
        user.isActive = isActive;
        user.head = head;
        user.profilePicture = profilePicture;

        const updateUser = await  user.save();
        res.json(updateUser);
    } catch (error){
        res.status(500).send({error: error.message});
    }
}
exports.activateUserProfile = async (req, res) => {

    try{

        const user = await User.findById(req.params.userId);

        if(!user) return res.status(404).send({message: 'User not found'});

        user.isActive = true;
        const updateUser = await user.save();
        res.status(200).json({user});
    }catch (error) {
        res.status(500).send({error: error.message});
    }
}

exports.deactivateUserProfile = async (req, res) => {

    try{

        const user = await User.findById(req.params.userId);

        if(!user) return res.status(404).send({message: 'User not found'});

        user.isActive = false;
        const updateUser = await user.save();
        res.status(200).json({user});
    }catch (error) {
        res.status(500).send({error: error.message});
    }
}

exports.getUsers = async (req, res) => {
    try{

        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Start of today
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // End of today

        const usersWithDetails = await User.aggregate([
            {
                $lookup: {
                    from: "attendances", // Name of the Attendance collection
                    localField: "_id",
                    foreignField: "userId",
                    as: "attendance",
                },
            },
            {
                $addFields: {
                    todaysAttendance: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$attendance",
                                    as: "attend",
                                    cond: {
                                        $and: [
                                            { $gte: ["$$attend.date", startOfDay] },
                                            { $lte: ["$$attend.date", endOfDay] },
                                        ],
                                    },
                                },
                            },
                            0,
                        ],
                    },
                },
            },
            {
                $lookup: {
                    from: "roles", // Name of the Role collection
                    localField: "role",
                    foreignField: "_id",
                    as: "role",
                },
            },
            {
                $unwind: {
                    path: "$role",
                    preserveNullAndEmptyArrays: true, // Handle users without a role
                },
            },
            {
                $lookup: {
                    from: "permissions", // Name of the Permissions collection
                    localField: "role.permissions",
                    foreignField: "_id",
                    as: "role.permissions",
                },
            },
            {
                $project: {
                    password: 0, // Exclude password field
                    attendance: 0, // Exclude full attendance array
                },
            },
        ]);

        if (!usersWithDetails) {
            return res.status(404).json({ message: "Users not found" });
        }

        res.status(200).json({ users: usersWithDetails });
    }catch (error) {
        res.status(500).send({error: error.message});
    }
}

exports.getUser = async (req, res) => {
    try{
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Start of today
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // End of today

        const user = await User.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(req.params.userId) }, // Filter by user ID
            },
            {
                $lookup: {
                    from: "attendances", // Attendance collection name
                    localField: "_id",
                    foreignField: "userId",
                    as: "attendance",
                },
            },
            {
                $addFields: {
                    todaysAttendance: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$attendance",
                                    as: "attend",
                                    cond: {
                                        $and: [
                                            { $gte: ["$$attend.date", startOfDay] },
                                            { $lte: ["$$attend.date", endOfDay] },
                                        ],
                                    },
                                },
                            },
                            0,
                        ],
                    },
                },
            },
            {
                $lookup: {
                    from: "roles", // Role collection name
                    localField: "role",
                    foreignField: "_id",
                    as: "role",
                },
            },
            {
                $unwind: {
                    path: "$role",
                    preserveNullAndEmptyArrays: true, // Handles users without a role
                },
            },
            {
                $lookup: {
                    from: "permissions", // Permissions collection name
                    localField: "role.permissions",
                    foreignField: "_id",
                    as: "role.permissions",
                },
            },
            {
                $project: {
                    password: 0, // Exclude password
                    attendance: 0, // Exclude full attendance array
                },
            },
        ]);

        if (!user || user.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user: user[0] }); // Return single user as object
    }catch (error) {
        res.status(500).send({error: error.message});
    }
}

exports.getUserById = async (userId) => {
    // console.log(userId);
    try{
        const _user = await User.findById(userId);
        return _user;
    }catch (e) {
        return null;
    }
}