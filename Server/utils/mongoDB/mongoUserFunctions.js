import {
	tasks as tasksCollection,
	teams as teamsCollection,
	users as usersCollection,
} from "../../config/mongoCollections.js";

import { v4 as uuidv4 } from "uuid";

import * as taskFunctions from "./mongoTaskFunctions.js";
import * as teamFunctions from "./mongoTeamFunctions.js";

// Function to get all the users
export const getAllUsers = async () => {
	const users = await usersCollection();
	const userList = await users.find({}).toArray();
	if (!userList) throw "No users found";
	return userList;
};

// Function to get a user by their id
export const getUserByID = async (userID) => {
	const users = await usersCollection();
	const user = await users.findOne({ _id: userID });
	if (!user) throw `Could not find user with id ${userID}`;
	return user;
};

// Function to get a user by their authID
export const getUserByAuthID = async (authID) => {
	const users = await usersCollection();
	const user = await users.findOne({ authID: authID });
	if (!user) throw `Could not find user with authID ${authID}`;
	return user;
};

// Function to get all teams a user is a part of
export const getTeamsByUserID = async (userID) => {
	const user = await getUserByID(userID);
	const teams = await teamsCollection();
	const teamList = await teams.find({ userIds: { $in: [userID] } }).toArray();
	if (!teamList) throw `Could not find teams for user with id ${userID}`;
	return teamList;
};

// Function to get all tasks a user is assigned to
export const getAssignedTasksByUserID = async (userID) => {
	const user = await getUserByID(userID);
	const tasks = await tasksCollection();
	const taskList = await tasks
		.find({ _id: { $in: user.assignedTasks } })
		.toArray();
	if (!taskList)
		throw `Could not find assigned tasks for user with id ${userID}`;
	return taskList;
};

// Function to create a new user
export const createUser = async (params = {}) => {
	const users = await usersCollection();

	// Default params
	let defaultParams = {
		authID: undefined,
		username: undefined,
		firstName: undefined,
		lastName: undefined,
	};

	// Adding the params to the default params
	Object.keys(params).forEach((key) => {
		if (key in defaultParams) defaultParams[key] = params[key];
	});

	// If a default param is still undefined then throw an error
	Object.keys(defaultParams).forEach((key) => {
		if (defaultParams[key] === undefined)
			throw `Missing parameter ${key} in createUser`;
	});

	// Checking if the user already exists with the same authID or username
	const userWithAuthID = await users.findOne({
		$or: [
			{ authID: defaultParams.authID },
			{ username: defaultParams.username },
		],
	});
	if (userWithAuthID) throw "User already exists";

	// Object to insert into the database
	const newUser = {
		_id: uuidv4(),
		...defaultParams,
		teams: [],
		assignedTasks: [],
	};

	// Inserting the user into the database
	const insertInfo = await users.insertOne(newUser);
	if (!insertInfo.acknowledged)
		throw `Could not add user with username ${newUser.username}`;

	// Creating a team for the user
	const team = await teamFunctions.createTeamForNewUser(newUser._id);

	// Returning the new user
	return newUser;
};

// Function to add a team to a user
export const addTeamToUser = async (userID, teamID) => {
	const user = await getUserByID(userID);

	// Checking if the user is already a part of the team
	if (user.teams.includes(teamID))
		throw `User with id ${userID} is already a part of the team with id ${teamID}`;

	// Adding the team to the user
	const users = await usersCollection();
	const updateInfo = await users.updateOne(
		{ _id: userID },
		{ $push: { teams: teamID } }
	);

	// Checking if the team was added to the user
	if (!updateInfo.acknowledged)
		throw `Could not add team with id ${teamID} to user with id ${userID}`;

	// Returning the updated user
	return await getUserByID(userID);
};

// Function to delete a user
export const deleteUser = async (userID) => {
	const users = await usersCollection();

	// Deleting the user from all teams
	await teamFunctions.removeUserFromAllTeams(userID);

	// Deleting the user from all tasks
	await taskFunctions.removeUserFromAllTasks(userID);

	// Deleting the user
	const user = await users.findOneAndDelete({ _id: userID });
	if (!user) throw `Could not delete user with id ${userID}`;

	// Returning the deleted user
	return user.value;
};

// Function to remove a task from being assigned to all users
export const removeTaskFromAllUsers = async (taskID) => {
	const users = await usersCollection();

	// Removing the task from all users
	const updateInfo = await users.updateMany(
		{ assignedTasks: taskID },
		{ $pull: { assignedTasks: taskID } }
	);

	// Checking if the task was removed from all users
	if (!updateInfo.acknowledged)
		throw `Could not remove task with id ${taskID} from all users`;

	// Returning the updated users
	return await getAllUsers();
};

// Function to modify a user
export const modifyUser = async (userID, params = {}) => {
	const users = await usersCollection();
	const user = await getUserByID(userID);

	// Default params
	let defaultParams = {
		username: undefined,
		firstName: undefined,
		lastName: undefined,
	};

	// Adding the user's information to the default params
	Object.keys(user).forEach((key) => {
		if (key in defaultParams) defaultParams[key] = user[key];
	});

	// Adding the params to the default params
	Object.keys(params).forEach((key) => {
		if (key in defaultParams) defaultParams[key] = params[key];
	});

	// Updating the user
	let updateInfo = await users.updateOne(
		{ _id: userID },
		{ $set: defaultParams }
	);

	// Checking if the user was updated
	if (!updateInfo.acknowledged) throw `Could not update user with id ${userID}`;

	// Returning the updated user
	return await getUserByID(userID);
};

// // Function to add team to user
// export const addTeamToUser = async (userID, teamID) => {
// 	// Check if the user exists
// 	const users = await usersCollection();
// 	const user = await getUserByID(userID);
// 	if (!user) throw `Could not find user with id ${userID}`;

// 	// Check if the team exists
// 	const teams = await teamsCollection();
// 	const team = await teamFunctions.getTeamByID(teamID);
// 	if (!team) throw `Could not find team with id ${teamID}`;

// 	// Adding the team to the user
// 	let updateInfo = await users.updateOne(
// 		{ _id: userID },
// 		{ $addToSet: { teams: teamID } }
// 	);

// 	// Checking if the user was added to the team
// 	if (!updateInfo.acknowledged)
// 		throw `Could not add team with id ${teamID} to user with id ${userID}`;

// 	// Returning the updated team
// 	return await getUserByID(teamID);
// };
