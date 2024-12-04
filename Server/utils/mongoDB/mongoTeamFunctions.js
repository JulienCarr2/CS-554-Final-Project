import { teams as teamsCollection } from "../../config/mongoCollections.js";

import { v4 as uuidv4 } from "uuid";

import * as taskFunctions from "./mongoTaskFunctions.js";
import * as userFunctions from "./mongoUserFunctions.js";

// Function to get all the teams
export const getAllTeams = async () => {
	const teams = await teamsCollection();
	const teamList = await teams.find({}).toArray();
	if (!teamList) throw "No teams found";
	return teamList;
};

// Function to get a team by its id
export const getTeamByID = async (_id) => {
	const teams = await teamsCollection();
	const team = await teams.findOne({ _id: _id });
	if (!team) throw `Could not find team with id ${_id}`;
	return team;
};

// Function to return all the admins of a team as objects
export const getTeamAdmins = async (teamID) => {
	const team = await getTeamByID(teamID);
	let admins = team.adminIds;
	admins = await Promise.all(
		admins.map(async (adminID) => {
			return userFunctions.getUserByID(adminID);
		})
	);
	console.log(admins);
	return admins;
};

// Function to return all the non-admins of a team as objects
export const getTeamNonAdmins = async (teamID) => {
	const team = await getTeamByID(teamID);
	let nonAdmins = team.userIds;
	nonAdmins = nonAdmins.filter((userID) => !team.adminIds.includes(userID));
	nonAdmins = await Promise.all(
		nonAdmins.map(async (nonAdminID) => {
			return await userFunctions.getUserByID(nonAdminID);
		})
	);
	return nonAdmins;
};

// Function to return all the projects of a team as objects
export const getTeamProjects = async (teamID) => {
	const team = await getTeamByID(teamID);
	let projects = team.projectIDs;
	projects = await Promise.all(
		projects.map(async (projectID) => {
			projectID = await taskFunctions.getTaskByID(projectID);
			return projectID;
		})
	);
	return projects;
};

// Function to check if a user is an admin of a team
export const checkUserIsAdmin = async (userID, teamID) => {
	const team = await getTeamByID(teamID);
	const user = await userFunctions.getUserByID(userID);
	if (!team) throw `Could not find team with id ${teamID}`;
	if (!user) throw `Could not find user with id ${userID}`;
	return team.adminIds.includes(userID);
};

// Function to add a project to a team
export const addProjectToTeam = async (teamID, projectID) => {
	const teams = await teamsCollection();
	const team = await getTeamByID(teamID);
	if (!team) throw `Could not find team with id ${teamID}`;

	// Adding the project to the team
	let updateInfo = await teams.updateOne(
		{ _id: teamID },
		{ $addToSet: { projectIDs: projectID } }
	);

	// Checking if the project was added to the team
	if (!updateInfo.acknowledged)
		throw `Could not add project with id ${projectID} to team with id ${teamID}`;

	// Returning the updated team
	return await getTeamByID(teamID);
};

// Function to create a new team
export const createTeam = async (userID, params = {}) => {
	const teams = await teamsCollection();

	// Check if the user exists
	const user = await userFunctions.getUserByID(userID);
	if (!user) throw `Could not find user with id ${userID}`;

	// Default params
	let defaultParams = {
		name: undefined,
		description: undefined,
	};

	// If there is a teamName param, add it to the name
	if (params.teamName) defaultParams.name = params.teamName;

	// If there is a teamDescription param, add it to the description
	if (params.teamDescription)
		defaultParams.description = params.teamDescription;

	// If the name is undefined then throw an error
	if (defaultParams.name === undefined)
		throw `Missing parameter name in createTeam`;

	// Checking if the team already exists with the same name
	const teamWithName = await teams.findOne({
		name: defaultParams.name,
	});
	if (teamWithName) throw `Team with name ${defaultParams.name} already exists`;

	// Object to insert into the database
	const newTeam = {
		_id: uuidv4(),
		...defaultParams,
		adminIds: [userID],
		userIds: [userID],
		projectIDs: [],
	};

	// Inserting the team into the database
	const insertInfo = await teams.insertOne(newTeam);
	if (!insertInfo.acknowledged)
		throw `Could not add team with name ${newTeam.name}`;

	// Adding the team to the user's teams
	await userFunctions.addTeamToUser(userID, newTeam._id);

	return newTeam;
};

// Function to add a user to a team
export const addUserToTeam = async (teamID, userID, userToAddID) => {
	const teams = await teamsCollection();
	const team = await getTeamByID(teamID);
	if (!team) throw `Could not find team with id ${teamID}`;

	// Check if the user exists
	const user = await userFunctions.getUserByID(userID);
	if (!user) throw `Could not find user with id ${userID}`;

	// Check if the userToAdd exists
	const userToAdd = await userFunctions.getUserByID(userToAddID);
	if (!userToAdd) throw `Could not find user with id ${userToAddID}`;

	// Check if the user is an admin of the team
	if (!team.adminIds.includes(userID))
		throw `User with id ${userID} is not an admin of team with id ${teamID}`;

	// Adding the user to the team
	let updateInfo = await teams.updateOne(
		{ _id: teamID },
		{ $addToSet: { userIds: userToAddID } }
	);

	// Checking if the user was added to the team
	if (!updateInfo.acknowledged)
		throw `Could not add user with id ${userToAddID} to team with id ${teamID}`;

	// Returning the updated team
	return await getTeamByID(teamID);
};

// Function to add a user to adminIds and userIds of a team
const addNewUserToTeamAdmins = async (userID, teamID) => {
	const teams = await teamsCollection();
	const team = await getTeamByID(teamID);
	if (!team) throw `Could not find team with id ${teamID}`;

	// Adding the user to the team
	let updateInfo = await teams.updateOne(
		{ _id: teamID },
		{ $addToSet: { adminIds: userID } },
		{ $addToSet: { userIds: userID } }
	);

	// Checking if the user was added to the team
	if (!updateInfo.acknowledged)
		throw `Could not add user with id ${userID} to team with id ${teamID}`;

	// Add the team to the user's teams
	await userFunctions.addTeamToUser(userID, teamID);

	// Returning the updated team
	return await getTeamByID(teamID);
};

// Function to set a user as admin of a team
export const setUserAsAdmin = async (teamID, userID, userToSetID) => {
	const teams = await teamsCollection();
	const team = await getTeamByID(teamID);
	if (!team) throw `Could not find team with id ${teamID}`;

	// Check if the user exists
	const user = await userFunctions.getUserByID(userID);
	if (!user) throw `Could not find user with id ${userID}`;

	// Check if the userToSet exists
	const userToSet = await userFunctions.getUserByID(userToSetID);
	if (!userToSet) throw `Could not find user with id ${userToSetID}`;

	// Check if the user is an admin of the team
	if (!team.adminIds.includes(userID))
		throw `User with id ${userID} is not an admin of team with id ${teamID}`;

	// Check if the userToSet is already an admin of the team
	if (team.adminIds.includes(userToSetID))
		throw `User with id ${userToSetID} is already an admin of team with id ${teamID}`;

	// Adding the user to the team
	let updateInfo = await teams.updateOne(
		{ _id: teamID },
		{ $addToSet: { adminIds: userToSetID } }
	);

	// Checking if the user was added to the team
	if (!updateInfo.acknowledged)
		throw `Could not add user with id ${userToSetID} to team with id ${teamID}`;

	// Returning the updated team
	return await getTeamByID(teamID);
};

// Function to create a team for a new user
export const createTeamForNewUser = async (userID) => {
	// Get the username of the user
	const user = await userFunctions.getUserByID(userID);
	if (!user) throw `Could not find user with id ${userID}`;
	const username = user.username;

	// Create a team for the user
	const team = await createTeam(userID, {
		teamName: `${username}'s Team`,
		teamDescription: `Your personal team for all your tasks`,
	});

	// Returning the team
	return team;
};

// Function to delete a team
export const deleteTeam = async (teamID, userID) => {
	const teams = await teamsCollection();

	// Check if the user exists
	const user = await userFunctions.getUserByID(userID);
	if (!user) throw `Could not find user with id ${userID}`;

	// Check if the team exists
	const team = await getTeamByID(teamID);
	if (!team) throw `Could not find team with id ${teamID}`;

	// Check if the user is an admin of the team
	if (!team.adminIds.includes(userID))
		throw `User with id ${userID} is not an admin of team with id ${teamID}`;

	//Removes each user from every task under the team before deleting the tasks
	team.userIds.forEach(async (userid) => {
		await taskFunctions.removeUserFromAllTeamTasks(teamID, userid);
	});

	// Removing all tasks from the team
	await taskFunctions.deleteAllTasksFromTeam(teamID);

	// Deleting the team
	const teamInfo = await teams.findOneAndDelete({ _id: teamID });
	if (!teamInfo) throw `Could not delete team with id ${teamID}`;

	// Returning the deleted team
	return teamInfo.value;
};

// Function to delete all empty teams
export const deleteAllEmptyTeams = async () => {
	const teams = await teamsCollection();

	// Getting all the empty teams
	const emptyTeams = await teams.find({ userIds: { $size: 0 } }).toArray();

	// Deleting all the empty teams
	const deleteInfo = await teams.deleteMany({ userIds: { $size: 0 } });

	// Checking if the teams were deleted
	if (!deleteInfo.acknowledged) throw `Could not delete all empty teams`;

	// Returning the deleted teams
	return emptyTeams;
};

// Function to remove a user from a team
export const removeUserFromTeam = async (userID, teamID) => {
	const teams = await teamsCollection();
	const team = await getTeamByID(teamID);
	if (!team) throw `Could not find team with id ${teamID}`;

	//Removes the user for all assigned tasks for this team
	taskFunctions.removeUserFromAllTeamTasks(teamID, userID);

	// Removing the user from the team
	let updateInfo = await teams.updateOne(
		{ _id: teamID },
		{ $pull: { userIds: userID } }
	);

	// Checking if the user was removed from the team
	if (!updateInfo.acknowledged)
		throw `Could not remove user with id ${userID} from team with id ${teamID}`;

	// Delete the team if it is empty
	if (team.userIds.length === 0) await deleteTeam(teamID);

	// Returning the updated team
	return await getTeamByID(teamID);
};

// Function to remove a user from all the teams
export const removeUserFromAllTeams = async (userID) => {
	const teams = await teamsCollection();

	// Removing the user from all the teams
	const updateInfo = await teams.updateMany(
		{ $or: [{ userIds: userID }, { adminIds: userID }] },
		{ $pull: { userIds: userID, adminIds: userID } }
	);
	if (!updateInfo.acknowledged)
		throw `Could not remove user with id ${userID} from all teams`;

	// Deleting all the empty teams
	await deleteAllEmptyTeams();

	// Returning the updated teams
	return await getAllTeams();
};

// Remove a project from a team
export const removeProjectFromTeam = async (projectID, teamID) => {
	const teams = await teamsCollection();
	const team = await getTeamByID(teamID);
	if (!team) throw `Could not find team with id ${teamID}`;

	// Removing the project from the team
	let updateInfo = await teams.updateOne(
		{ _id: teamID },
		{ $pull: { projectIDs: projectID } }
	);

	// Checking if the project was removed from the team
	if (!updateInfo.acknowledged)
		throw `Could not remove project with id ${projectID} from team with id ${teamID}`;

	// Returning the updated team
	return await getTeamByID(teamID);
};

// Remove a project from all teams
export const removeProjectFromAllTeams = async (projectID) => {
	const teams = await teamsCollection();

	// Removing the project from all the teams
	const updateInfo = await teams.updateMany(
		{ projectIDs: projectID },
		{ $pull: { projectIDs: projectID } }
	);
	if (!updateInfo.acknowledged)
		throw `Could not remove project with id ${projectID} from all teams`;

	// Returning the updated teams
	return await getAllTeams();
};

// Function to modify a team
export const modifyTeam = async (teamID, userID, params = {}) => {
	const teams = await teamsCollection();

	// Check if the team exists
	const team = await getTeamByID(teamID);
	if (!team) throw `Could not find team with id ${teamID}`;

	// Check if the user exists
	const user = await userFunctions.getUserByID(userID);
	if (!user) throw `Could not find user with id ${userID}`;

	// Check if the user is an admin of the team
	if (!team.adminIds.includes(userID))
		throw `User with id ${userID} is not an admin of team with id ${teamID}`;

	// Default params
	let defaultParams = {
		name: undefined,
		description: undefined,
	};

	// Adding the team's information to the default params
	Object.keys(team).forEach((key) => {
		if (key in defaultParams) defaultParams[key] = team[key];
	});

	// Adding the params to the default params
	// If there is a teamName param, add it to the name
	if (params.teamName) defaultParams.name = params.teamName;

	// If there is a teamDescription param, add it to the description
	if (params.teamDescription)
		defaultParams.description = params.teamDescription;

	// Updating the team
	let updateInfo = await teams.updateOne(
		{ _id: teamID },
		{ $set: defaultParams }
	);

	// Checking if the team was updated
	if (!updateInfo.acknowledged) throw `Could not update team with id ${teamID}`;

	// Returning the updated team
	return await getTeamByID(teamID);
};
