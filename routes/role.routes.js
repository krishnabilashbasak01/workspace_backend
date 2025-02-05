const express = require('express');
const {
    createRole,
    createPermission,
    updatePermission,
    deletePermission,
    updateRole,
    deleteRole,
    addPermissionToRole,
    removePermissionsFromRole,
    addRoleToUser, getRoleOfUser, getRoles, getPermissions
} = require('../controllers/role.controller');
const {authMiddleware, checkPermission} = require("../middlewares/auth.middleware");

const router = express.Router();
router.post('/', authMiddleware, createRole);

// Roles
router.get('/get-roles', authMiddleware, getRoles);
router.post('/create-role/', authMiddleware, createRole);
router.put('/update-role/:roleId', authMiddleware, updateRole);
router.delete('/delete-role/:roleId', authMiddleware, deleteRole);

// add and remove permission
router.put('/add-permission-to-role', authMiddleware, addPermissionToRole);
router.delete('/remove-permissions-from-role', authMiddleware, removePermissionsFromRole);
router.put('/add-role-to-user', authMiddleware, addRoleToUser);
// router.get('/get-role-of-user', authMiddleware, checkPermission('Super Admin','Update User'), getRoleOfUser);
router.get('/get-role-of-user', authMiddleware, getRoleOfUser);


// Permissions
router.get('/get-permissions', authMiddleware, getPermissions);
router.post('/create-permission', authMiddleware, createPermission);
router.put('/update-permission/:permissionId', authMiddleware, updatePermission);
router.delete('/delete-permission/:permissionId', authMiddleware, deletePermission);

module.exports = router;