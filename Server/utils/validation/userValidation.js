import * as baseValidation from "./baseValidation.js";

export const checkUserUsername = (username) => {
	username = baseValidation.checkString(username, "username");
	username = username.toLowerCase();
	if (username.length > 30) {
		throw `Error: ${username} is too long! (Longer than 30 characters)`;
	}
	return username;
};

export const checkUserName = (name, varName) => {
	name = baseValidation.checkString(name, varName);
	name = baseValidation.checkIsAlpha(name, varName);
	if (name.length > 20) {
		throw `Error: ${username} is too long! (Longer than 20 characters)`;
	}
	return name;
};

export const checkUserAuthID = (authID, varName) => {
	authID = baseValidation.checkString(authID, varName);
	if (!/^[a-zA-Z0-9-|]+$/.test(authID))
		throw `Error: ${varName} must be alphanumeric`;
	return authID;
};
