import {
	tasks as tasksCollection,
	teams as teamCollection,
	users as usersCollection,
} from "../../config/mongoCollections.js";

import * as teamFunctions from "./mongoTeamFunctions.js";
import * as userFunctions from "./mongoUserFunctions.js";

import { v4 as uuidv4 } from "uuid";

// Function to get all the tasks
export const getAllTasks = async () => {
	const tasks = await tasksCollection();
	const taskList = await tasks.find({}).toArray();
	if (!taskList) throw "No tasks found";
	return taskList;
};

// Function to get a task by its id
export const getTaskByID = async (TaskID) => {
	const tasks = await tasksCollection();
	const task = await tasks.findOne({ _id: TaskID });
	if (!task) throw `Could not find task with id ${TaskID}`;
	return task;
};

// Function to get a list of tasks by their root id
export const getTaskByRootID = async (TaskRootID) => {
	const tasks = await tasksCollection();
	const taskList = await tasks.find({ rootID: TaskRootID }).toArray();
	if (!taskList) throw "No tasks found";
	return taskList;
};

// Function to get all the subtasks of a task
export const getSubtasksFromTask = async (taskID) => {
	const tasks = await tasksCollection();
	const task = await getTaskByID(taskID);
	const subtasks = await tasks
		.find({ _id: { $in: task.subtaskIDs } })
		.toArray();
	return subtasks;
};

// Function to get the parent of a task
export const getParentFromTask = async (taskID) => {
	const tasks = await tasksCollection();
	const task = await getTaskByID(taskID);
	const parent = await tasks.findOne({ _id: task.parentID });
	return parent;
};

// Function to get the root of a task
export const getRootTask = async (taskID) => {
	const tasks = await tasksCollection();
	const task = await getTaskByID(taskID);
	const root = await tasks.findOne({ _id: task.rootID });
	return root;
};

// Function to get all the users assigned to a task
export const assignedUsersFromTask = async (taskID) => {
	const users = await usersCollection();
	const task = await getTaskByID(taskID);
	const assignedUsers = await users
		.find({ _id: { $in: task.assignedUserIDs } })
		.toArray();
	return assignedUsers;
};

// Function to get all the team assigned to the task
export const getTeamFromTask = async (taskID) => {
	const task = await getTaskByID(taskID);
	const teams = await teamCollection();
	const team = await teams.findOne({ _id: task.teamID });
	return team;
};

// Function to get the progress of a task
export async function getProgressFromTask(taskID) {
	const task = await getTaskByID(taskID);
	const subtasks = await getSubtasksFromTask(taskID);
	if (subtasks.length === 0) return task.completed ? 1 : 0;
	let totalSubtaskProgress = 0;
	for (const subtask of subtasks) {
		const subtaskProgress = await getProgressFromTask(subtask._id);
		totalSubtaskProgress += subtaskProgress;
	}
	const progress = totalSubtaskProgress / subtasks.length;
	return progress;
}

// Function to add a task to its parent's subtasks
const addTaskToParentSubtasks = async (TaskID) => {
	const tasks = await tasksCollection();
	const task = await getTaskByID(TaskID);
	if (!task) throw `Could not find task with id ${TaskID}`;

	// If the task has a parent then add it to the parent's subtasks
	if (task.parentID) {
		const parent = await getTaskByID(task.parentID);
		if (!parent) throw `Could not find parent task with id ${task.parentID}`;

		// Adding the task to the parent's subtasks
		const updateInfo = await tasks.updateOne(
			{ _id: parent._id },
			{ $addToSet: { subtaskIDs: TaskID } }
		);
		if (!updateInfo.acknowledged)
			throw `Could not add task with id ${TaskID} to parent task with id ${parent._id}`;

		// Returning the updated parent
		return await getTaskByID(parent._id);
	}
};

// Function to create a new task
export const createTask = async (userID, teamID, params = {}) => {
	const tasks = await tasksCollection();

	// Checking if the user is an admin of the team
	if (!(await teamFunctions.checkUserIsAdmin(userID, teamID)))
		throw `User with id ${userID} is not an admin of the team with id ${teamID}`;

	// Default params
	let defaultParams = {
		name: undefined,
		description: undefined,
		dueDate: undefined,
		priority: undefined,
		parentID: undefined,
		rootID: undefined,
	};

	// Adding the params to the default params
	Object.keys(params).forEach((key) => {
		const key_copy = key;
		key = key.replace("task", "");
		key = key.charAt(0).toLowerCase() + key.slice(1);
		if (key in defaultParams) defaultParams[key] = params[key_copy];
	});

	// Adding the parent ID to the default params if it is passed in
	if (params.parentTaskID) defaultParams.parentID = params.parentTaskID;

	// If there is no name then throw an error
	if (!defaultParams.name) throw "Missing parameter name in createTask";

	// Checking if a task wit the same name already exists in the same team
	const taskWithName = await tasks.findOne({
		$and: [{ name: defaultParams.name }, { teamID: teamID }],
	});
	if (taskWithName)
		throw `Task with name ${defaultParams.name} already exists in the team`;

	// If there is a parent task, take the parent's teamID and rootID
	if (defaultParams.parentID) {
		const parent = await getTaskByID(defaultParams.parentID);
		if (!parent)
			throw `Could not find parent task with id ${defaultParams.parentID}`;
		defaultParams.teamID = parent.teamID;
		defaultParams.rootID = parent.rootID ? parent.rootID : parent._id;
	}

	// Object to insert into the database
	const newTask = {
		_id: uuidv4(),
		...defaultParams,
		teamID: teamID,
		subtaskIDs: [],
		assignedUserIDs: [],
		completed: false,
	};
	if (!newTask.parentID) {
		newTask.rootID = newTask._id;
	}

	// Inserting the task into the database
	const insertInfo = await tasks.insertOne(newTask);
	if (!insertInfo.acknowledged)
		throw `Could not add task with name ${newTask.name}`;

	// Adding the task to the parent's subtasks
	await addTaskToParentSubtasks(newTask._id);

	// If there is no root, then add the task to the team as a project
	if (!defaultParams.rootID) {
		await teamFunctions.addProjectToTeam(newTask.teamID, newTask._id);
	}

	return newTask;
};

// Function to assign a task to a user
export const assignTaskToUser = async (taskID, userID) => {
	const users = await usersCollection();
	const tasks = await tasksCollection();

	// Checking if the user is already assigned to the task
	const task = await getTaskByID(taskID);
	if (task.assignedUserIDs.includes(userID))
		throw `User with id ${userID} is already assigned to task with id ${taskID}`;

	// Assigning the task to the user
	const updateInfo = await tasks.updateOne(
		{ _id: taskID },
		{ $addToSet: { assignedUserIDs: userID } }
	);

	// Checking if the task was assigned to the user
	if (!updateInfo.acknowledged)
		throw `Could not assign task with id ${taskID} to user with id ${userID}`;

	// Adding the task to the user's assigned tasks
	const userUpdateInfo = await users.updateOne(
		{ _id: userID },
		{ $addToSet: { assignedTasks: taskID } }
	);

	// Checking if the task was added to the user's assigned tasks
	if (!userUpdateInfo.acknowledged)
		throw `Could not add task with id ${taskID} to user with id ${userID}`;

	return await getTaskByID(taskID);
};

// Function to remove a parent task from its subtasks
// (This function will set the task's parentID to be the parent of the subtasks if applicable)
const removeParentalFromSubtasks = async (TaskID) => {
	const tasks = await tasksCollection();
	const task = await getTaskByID(TaskID);
	if (!task) throw `Could not find task with id ${TaskID}`;

	// If the task has subtasks then remove it from the subtasks' parent
	if (task.subtaskIDs.length > 0) {
		// Removing the parent from the subtasks
		const updateInfo = await tasks.updateMany(
			{ _id: { $in: task.subtaskIDs } },
			{ $set: { parentID: task.parentID ? task.parentID : undefined } }
		);
		if (!updateInfo.acknowledged)
			throw `Could not remove parent task with id ${TaskID} from subtasks`;
	}
};

// Function to remove a task from its parent
const removeTaskFromParent = async (TaskID) => {
	const tasks = await tasksCollection();
	const task = await getTaskByID(TaskID);
	if (!task) throw `Could not find task with id ${TaskID}`;

	// If the task has a parent then remove it from the parent's subtasks
	if (task.parentID) {
		const parent = await getTaskByID(task.parentID);
		if (!parent) throw `Could not find parent task with id ${task.parentID}`;

		// Removing the task from the parent's subtasks
		const updateInfo = await tasks.updateOne(
			{ _id: parent._id },
			{ $pull: { subtaskIDs: TaskID } }
		);
		if (!updateInfo.acknowledged)
			throw `Could not remove task with id ${TaskID} from parent task with id ${parent._id}`;

		// Returning the updated parent
		return await getTaskByID(parent._id);
	}
};

// Function to delete a task
export const deleteTask = async (taskID, userID) => {
	const tasks = await tasksCollection();

	// Checking if the user is an admin of the team
	const task = await getTaskByID(taskID);
	if (!(await teamFunctions.checkUserIsAdmin(userID, task.teamID)))
		throw `User with id ${userID} is not an admin of the team with id ${task.teamID}`;

	// Remove the task from all teams if it is a project
	await teamFunctions.removeProjectFromAllTeams(taskID);

	// Remove the task from all users if it is assigned to any
	await userFunctions.removeTaskFromAllUsers(taskID);

	// Remove the parental relationship between the task and its subtasks
	await removeParentalFromSubtasks(taskID);

	// Remove the task from its parent
	await removeTaskFromParent(taskID);

	// Deleting the task
	const taskDeletion = await tasks.findOneAndDelete({ _id: taskID });
	if (!taskDeletion) throw `Could not delete task with id ${taskID}`;

	// Returning the deleted task
	return taskDeletion.value;
};

// Function to remove a user from a task
export const removeUserFromTask = async (userID, taskID) => {
	const tasks = await tasksCollection();

	// Removing the user from the task
	const updateInfo = await tasks.updateOne(
		{ _id: taskID },
		{ $pull: { assignedUserIDs: userID } }
	);
	if (!updateInfo.acknowledged)
		throw `Could not remove user with id ${userID} from task with id ${taskID}`;

	// Returning the updated task
	return await getTaskByID(taskID);
};

// Function to remove a user from all tasks
export const removeUserFromAllTasks = async (userID) => {
	const tasks = await tasksCollection();

	// Removing the user from all tasks
	const updateInfo = await tasks.updateMany(
		{ assignedUserIDs: userID },
		{ $pull: { assignedUserIDs: userID } }
	);
	if (!updateInfo.acknowledged)
		throw `Could not remove user with id ${userID} from all tasks`;

	// Returning the updated tasks
	return await getAllTasks();
};

// Function to remove a user from all tasks for a team
export const removeUserFromAllTeamTasks = async (teamID, userID) => {
	const tasks = await tasksCollection();

	// Removing the user from all tasks
	const updateInfo = await tasks.updateMany(
		{ $and: [{ assignedUserIDs: { $in: [userID] } }, { teamID: teamID }] },
		{ $pull: { assignedUserIDs: userID } }
	);
	if (!updateInfo.acknowledged)
		throw `Could not remove user with id ${userID} from all team tasks`;

	// Returning the updated tasks
	return await getAllTasks();
};

// Function to delete all tasks corresponding to a team
export const deleteAllTasksFromTeam = async (teamID) => {
	const tasks = await tasksCollection();
	const teamTasks = await tasks.find({ teamID: teamID }).toArray();

	teamTasks.forEach(async (task) => {
		await userFunctions.removeTaskFromAllUsers(task._id);
	});

	// Deleting all tasks corresponding to the team
	const updateInfo = await tasks.deleteMany({ teamID: teamID });
	if (!updateInfo.acknowledged)
		throw `Could not delete all tasks from team with id ${teamID}`;

	// Returning the updated tasks
	return await getAllTasks();
};

// Function to modify a task
export const modifyTask = async (TaskID, userID, params = {}) => {
	const tasks = await tasksCollection();
	const task = await getTaskByID(TaskID);

	// Checking if the user is an admin of the team
	if (!(await teamFunctions.checkUserIsAdmin(userID, task.teamID)))
		throw `User with id ${userID} is not an admin of the team with id ${task.teamID}`;

	// Default params
	let defaultParams = {
		name: undefined,
		description: undefined,
		dueDate: undefined,
		priority: undefined,
		parentID: undefined,
		completed: undefined,
	};

	// Adding the task's information to the default params
	Object.keys(task).forEach((key) => {
		if (key in defaultParams) defaultParams[key] = task[key];
	});

	// Adding the params to the default params
	Object.keys(params).forEach((key) => {
		const key_copy = key;
		key = key.replace("task", "");
		key = key.charAt(0).toLowerCase() + key.slice(1);
		if (key in defaultParams) defaultParams[key] = params[key_copy];
	});

	// Adding the parent ID to the default params if it is passed in
	if (params.parentTaskID && params.parentTaskID !== task.parentID) {
		const newParentTask = await getTaskByID(params.parentTaskID);
		if (newParentTask.teamID !== task.teamID)
			throw `Parent task with id ${params.parentTaskID} is not in the same team as task with id ${TaskID}`;
		await removeTaskFromParent(TaskID);
		defaultParams.parentID = params.parentTaskID;
	}

	// Updating the task
	let updateInfo = await tasks.updateOne(
		{ _id: TaskID },
		{ $set: defaultParams }
	);

	// Checking if the task was updated
	if (!updateInfo.acknowledged) throw `Could not update task with id ${TaskID}`;

	// Adding the task to the parent's subtasks
	if (params.parentTaskID && params.parentTaskID !== task.parentID)
		await addTaskToParentSubtasks(TaskID);

	// Returning the updated task
	return await getTaskByID(TaskID);
};
