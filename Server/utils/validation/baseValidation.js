import validator from "validator";

export const checkString = (
	strVal,
	varName,
	minChars = 0,
	maxChars = Infinity
) => {
	if (!strVal || typeof strVal === "undefined") {
		throw `Error: You must supply a${
			varName[0].match(/[aeiou]/i) ? "n" : ""
		} ${varName}`;
	}
	if (typeof strVal !== "string") throw `Error: ${varName} must be a string`;
	strVal = strVal.trim();
	if (strVal.length === 0) throw `Error: ${varName} cannot be empty`;
	if (strVal.length < minChars)
		throw `Error: ${varName} must be at least ${minChars} character${
			minChars > 1 ? "s" : ""
		} long`;
	if (strVal.length > maxChars)
		throw `Error: ${varName} cannot be greater than ${maxChars} character${
			maxChars > 1 ? "s" : ""
		} long`;
	return strVal;
};

export const checkNumber = (
	numVal,
	varName,
	minimum = -Infinity,
	maximum = Infinity
) => {
	if ((!numVal && numVal !== 0) || typeof numVal === "undefined") {
		throw `Error: You must supply a ${varName}`;
	}
	if (typeof numVal !== "number") throw `Error: ${varName} must be a number`;
	if (isNaN(numVal)) throw `Error: ${varName} cannot be NaN`;
	if (numVal < minimum)
		throw `Error: ${varName} cannot be less than ${minimum}`;
	if (numVal > maximum)
		throw `Error: ${varName} cannot be greater than ${maximum}`;
	return numVal;
};

export const checkInt = (
	intVal,
	varName,
	minimum = -Infinity,
	maximum = Infinity
) => {
	intVal = checkNumber(intVal, varName, minimum, maximum);
	if (!Number.isInteger(intVal)) throw `Error: ${varName} must be an integer`;
	return intVal;
};

export const checkUUID = (uuidVal, varName) => {
	uuidVal = checkString(uuidVal, varName);
	if (!validator.isUUID(uuidVal))
		throw `Error: ${varName} must be a valid UUID`;
	return uuidVal;
};

export const checkArray = (arrVal, varName, minElements = 0) => {
	if (!arrVal || typeof arrVal === "undefined")
		throw `Error: You must supply a ${varName}`;
	if (!Array.isArray(arrVal)) throw `Error: ${varName} must be an array`;
	if (arrVal.length < minElements)
		throw `Error: ${varName} must have at least ${minElements} element${
			minElements > 1 ? "s" : ""
		}`;
	return arrVal;
};

export const checkArrayStrings = (
	arrVal,
	varName,
	minElements = 0,
	minChars = 0,
	maxChars = Infinity
) => {
	checkArray(arrVal, varName, minElements);
	arrVal.forEach((element) => {
		checkString(element, element + " in " + varName, minChars, maxChars);
	});
	return arrVal;
};

export const checkDate = (dateVal, varName) => {
	dateVal = checkString(dateVal, varName);
	const dateObj = new Date(dateVal);
	if (dateObj.toString() === "Invalid Date" || isNaN(dateObj))
		throw `Error: ${varName} must be a valid date`;
	// Check if the date is in the future
	if (dateObj < new Date()) throw `Error: ${varName} cannot be in the past`;
	return dateVal;
};

export const checkBoolean = (boolVal, varName) => {
	if (typeof boolVal === "undefined")
		throw `Error: You must supply a ${varName}`;
	if (typeof boolVal !== "boolean") throw `Error: ${varName} must be a boolean`;
	return boolVal;
};

export const checkIsAlphanumeric = (strVal, varName) => {
	if (!/^[a-zA-Z0-9 ]+$/.test(strVal))
		throw `Error: ${varName} must be alphanumeric`;
	return strVal;
};

export const checkIsAlpha = (strVal, varName) => {
	if (!/^[a-zA-Z ]+$/.test(strVal))
		throw `Error: ${varName} must be alphabetic`;
	return strVal;
};
