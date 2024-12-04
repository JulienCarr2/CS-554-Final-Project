import * as baseValidation from "./baseValidation.js";

export const checkTeamName = (name) => {
	name = baseValidation.checkString(name, "name", 1, 30);
	return name;
};

export const checkTeamDescription = (description) => {
	description = baseValidation.checkString(description, "description", 1, 255);
	return description;
};
