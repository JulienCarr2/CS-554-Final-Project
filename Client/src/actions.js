const login = (id) => ({
	type: "LOGIN",
	payload: {
		id: id,
	},
});

const logout = () => ({
	type: "LOGOUT",
	payload: {},
});

const newTask = (id) => ({
	type: "NEW_TASK",
});

const deletedTask = (id) => ({
	type: "DELETED_TASK",
});

const newTeam = (id) => ({
	type: "NEW_TEAM",
});

export { deletedTask, login, logout, newTask, newTeam };
