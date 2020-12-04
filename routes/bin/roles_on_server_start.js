const { User, UserRole, Role } = require("../../models");
const { getRoleId } = require("../middlewares");

// Create default roles when the server starts
const createDefaultRoles = async function () {
  try {
    const user_role_exists = await Role.findOne({ where: { role_name: "user" } });
    if (!user_role_exists) {
      await Role.create({ role_name: "user" });
    }
    const admin_role_exists = await Role.findOne({ where: { role_name: "admin" } });
    if (!admin_role_exists) {
      await Role.create({ role_name: "admin" });
    }
  } catch (error) {
    console.error(error);
  }
};

// Legacy version의 API server를 위하여 모든 사용자를 검색 후 만약 역할이 존재하지 않는다면 일반 사용자 새로 생성
const assignRolesToLegacyUsers = async function () {
  try {
    const users = await User.findAll({ include: [{ model: UserRole, required: false }] });

    for (let i = 0; i < users.length; i++) {
      if (!users[i].user_role) {
        const user_id = users[i].id; // 사용자 ID
        const role_id = await getRoleId("user"); // 일반 사용자 역할 ID
        await UserRole.create({ user_id, role_id });
      }
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  createDefaultRoles,
  assignRolesToLegacyUsers,
};
