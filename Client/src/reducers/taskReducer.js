import { v4 as uuid } from "uuid";

const initalState = { id: undefined };

const userReducer = (state = initalState, action) => {
	const { type, payload } = action;

	switch (type) {
		case "NEW_TASK":
			return { ...state, newTask: uuid() };
		case "DELETED_TASK":
			return { ...state, deletedTask: uuid() };
		default:
			return state;
	}
};

export default userReducer;
