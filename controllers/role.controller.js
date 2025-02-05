const Role = require("../models/Role");
const Permission = require("../models/Permission");
const User = require("../models/User");


// Get Roles

exports.getRoles = async (req, res) => {
  try{
    const roles = await Role.find({}).populate(
        {
          path: "permissions",
        }
    );
    res.status(200).json(roles);
  }catch (error) {
    res.status(400).send({error : error.message})
  }
}

// Create Role
exports.createRole = async (req, res) => {
  try {
    const { name, description } = req.body;
    const roleExists = await Role.findOne({ name });
    if (roleExists)
      return res.status(400).send({
        error: "Role already exists",
      });

    const newRole = new Role({ name, description });
    await newRole.save();
    res.status(200).send({ newRole });
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  try {
    const {name, description} = req.body;
    const {roleId} = req.params;

    let data = {};
    if (name) data.name = name;
    if (description) data.description = description;


    let _role = await Role.findOneAndUpdate({_id: roleId}, data, {new: true})

    res.status(200).json({_role});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const deletedPermission = await Role.findByIdAndDelete(roleId);

    res.status(204).json({ deletedPermission });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// // Create permission
// exports.deletePermission = async (req, res) => {
//   try{
//     const {roleId} = req.params;
//     const deletePermission = await Role.findByIdAndDelete(roleId);
//     res.status(204).json({ deletePermission});
//   }catch (error) {
//     res.status(500).send({error: error.message});
//   }
// }

// Get Permissions
exports.getPermissions = async (req, res) => {
  try{
    const permissions = await Permission.find({});
    res.status(200).json(permissions);
  }catch (error) {
    res.status(500).send({error: error.message});
  }
}

// Create permission
exports.createPermission = async (req, res) => {
  try{
    const { name, description } = req.body;
    const newPermission = new Permission({ name, description });
    await newPermission.save();
    res.status(200).json({ newPermission });
  }catch(error){
    res.status(400).send({error: error.message});
  }
}

// Update Permission
exports.deletePermission = async (req, res) => {
  try {
    const {name, description} = req.body;
    const {permissionId} = req.params;

    const _permission = await Permission.findByIdAndDelete( permissionId)

    res.status(204).json({ _permission });
  }catch (error) {
    res.status(500).send({error: error.message});
  }
}

// Delete Permission
exports.deletePermission = async (req, res) => {
  try{
    const {permissionId} = req.params;
    const deletedPermission = await Permission.findByIdAndDelete(permissionId);
    if (!deletedPermission) return res.status(400).send({error: "Permission not found"});

    res.status(202).json({message: "Permission deleted successfully" });

  }catch (error) {
    res.status(500).send({error: error.message});
  }
}

// Add Permissions to Role
exports.addPermissionToRole = async (req, res) => {
  try {
    const {roleId, permissions} = req.body;
    const role = await Role.findById(roleId);

    role.permissions = permissions;
    await role.save();

    res.status(200).send({role});

  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

// Remove Permission From Role
exports.removePermissionsFromRole = async (req, res) => {
  try {

    const {roleId, permissions} = req.body;

    const role = await Role.findById(roleId);

    role.permissions = role.permissions.filter((permission) => !permissions.includes(permission.toString()));
    await role.save();
    res.status(200).send({role});
  } catch (err) {
    res.status(500).send({error: err.message});
  }
}


// Add Role To User
exports.addRoleToUser = async (req, res) => {
  try {
    const {userId, roleId} = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(400).send({error: 'User does not exist'});

    user.role = roleId;
    await user.save();

    res.status(200).send({user});
  } catch (error) {
    res.status(500).send({error: error.message});
  }
}

// Remove Role From User
exports.removeRoleFromUser = async (req, res) => {
}

// Get user roles
exports.getRoleOfUser = async (req, res) => {
  try {

    const user = await User.findById(req.user.id).populate({
      path: "role",
      populate: {
        path: "permissions", // Populate permissions within roles
        select: "name description", // Only return necessary fields
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const userRoles = user.role
        ? {
          name: user.role.name,
          permissions: user.role.permissions,
        }
        : null;

    res.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: userRoles,
      },
    });
  } catch (err) {
    res.status(404).send({error: err.message});
  }
}

// updatePermission
exports.updatePermission = async (req, res) => {
  try{
    const {name, description} = req.body;
    const {permissionId} = req.params;

    let data = {}
    if(name) data.name = name;
    if(description) data.description = description;

    let _permission = await Permission.findOneAndUpdate({_id: permissionId}, data, {new: true});


    res.status(200).send({message: "Permission updated successfully" , permission: _permission});
  }catch (error) {
    res.status(500).send({error: error.message});
  }
}
