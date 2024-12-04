import * as baseValidation from "./baseValidation.js";

export const checkUserUsername = (username) => {
	username = baseValidation.checkString(username, "username");
	username = username.toLowerCase();
	return username;
};

export const checkUserName = (name, varName) => {
	name = baseValidation.checkString(name, varName);
	name = baseValidation.checkIsAlpha(name, varName);
	return name;
};

export const checkUserAuthID = (authID, varName) => {
	authID = baseValidation.checkString(authID, varName);
	if (!/^[a-zA-Z0-9-|]+$/.test(authID))
		throw `Error: ${varName} must be alphanumeric`;
	return authID;
};
