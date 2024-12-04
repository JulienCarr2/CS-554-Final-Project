import * as baseValidation from "./baseValidation.js";

export const checkTaskName = (name) => {
	name = baseValidation.checkString(name, "name", 1, 30);
	return name;
};

export const checkTaskDescription = (description) => {
	description = baseValidation.checkString(description, "description", 1, 255);
	return description;
};

export const checkTaskDueDate = (dueDate) => {
	dueDate = baseValidation.checkDate(dueDate, "dueDate");
	return dueDate;
};

// Need to figure out how to check for valid priority
export const checkTaskPriority = (priority) => {
	priority = baseValidation.checkInt(priority, "priority", 1, 5);
	return priority;
};

export const checkTaskCompleted = (completed) => {
	completed = baseValidation.checkBoolean(completed, "completed");
	return completed;
};
