import { v4 as uuid } from "uuid";
//import * as userFunctions from "../../utils/mongoDB/mongoUserFunctions";

const initalState = { id: undefined };

let copyState = null;
let index = 0;

const userReducer = (state = initalState, action) => {
	const { type, payload } = action;

	switch (type) {
		case "LOGIN":
			return { id: payload.id };
		case "LOGOUT":
			return { id: undefined };

		default:
			return state;
	}
};

export default userReducer;
