import * as baseValidation from "./baseValidation.js";

export const checkTaskName = (name) => {
	name = baseValidation.checkString(name, "name", 1, 50);
	return name;
};

export const checkTaskDescription = (description) => {
	description = baseValidation.checkString(description, "description", 1);
	return description;
};

export const checkTaskDueDate = (dueDate) => {
	dueDate = baseValidation.checkDate(dueDate, "dueDate");
	return dueDate;
};

// Need to figure out how to check for valid priority
export const checkTaskPriority = (priority) => {
	priority = baseValidation.checkInt(priority, "priority", 0, 5);
	return priority;
};

export const checkTaskCompleted = (completed) => {
	completed = baseValidation.checkBoolean(completed, "completed");
	return completed;
};
