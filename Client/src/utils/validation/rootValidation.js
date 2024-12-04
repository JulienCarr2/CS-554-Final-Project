import * as baseValidations from "./baseValidation.js";
import * as userValidations from "./userValidation.js";
import * as teamValidations from "./teamValidation.js";
import * as taskValidations from "./taskValidation.js";

export default {
	...baseValidations,
	...userValidations,
	...teamValidations,
	...taskValidations,
};
