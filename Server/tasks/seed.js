import { closeConnection, dbConnection } from "../config/mongoConnection.js";
import * as userFunctions from "../utils/mongoDB/mongoUserFunctions.js";
import * as teamFunctions from "../utils/mongoDB/mongoTeamFunctions.js";
import * as taskFunctions from "../utils/mongoDB/mongoTaskFunctions.js";

// Main function for the seed script
const main = async () => {
	// Connect to the database and drop it
	const db = await dbConnection();
	await db.dropDatabase();

	//Creating 2 different users
	let jcarr2;
	try {
		jcarr2 = await userFunctions.createUser({
			authID: "google-oauth2|115025089960660384256",
			username: "jcarr2",
			firstName: "Julien",
			lastName: "Carr",
		});
	} catch (e) {
		console.error(e);
	}

	let rvaccone;
	try {
		rvaccone = await userFunctions.createUser({
			authID: "google-oauth2|112475117584132468048",
			username: "rvaccone",
			firstName: "Rocco",
			lastName: "Vaccone",
		});
	} catch (e) {
		console.error(e);
	}

	// Create an additional team on Julien's user. Add Rocco as a team member.
	let jTeam;
	try {
		jTeam = await teamFunctions.createTeam(jcarr2._id, { teamName: "jTeam", teamDescription: "Seeded DB Team." });
		await teamFunctions.addUserToTeam(jTeam._id, jcarr2._id, rvaccone._id);
	} catch (e) {
		console.error(e);
	}

	// Create two tasks, then create a subtask for the first task. Assign Julien and Rocco to respective tasks.
	try {
		let seed1 = await taskFunctions.createTask(jcarr2._id, jTeam._id, {
			name: "Seed #1",
			description: "Julien and Rocco's Task",
			dueDate: "2024-06-07",
			priority: 4
		});

		await taskFunctions.assignTaskToUser(seed1._id, jcarr2._id);
		await taskFunctions.assignTaskToUser(seed1._id, rvaccone._id);

		let seed2 = await taskFunctions.createTask(jcarr2._id, jTeam._id, {
			name: "Seed #2",
			description: "Julien's Task",
			dueDate: "2024-06-07",
			priority: 2,
			parentID: seed1._id,
			rootID: seed1._id,
		});
		await taskFunctions.assignTaskToUser(seed2._id, jcarr2._id);

		let seed3 = await taskFunctions.createTask(jcarr2._id, jTeam._id, {
			name: "Seed #3",
			description: "Rocco's Task",
			dueDate: "2024-07-15",
			priority: 3
		});
		await taskFunctions.assignTaskToUser(seed3._id, rvaccone._id);

	} catch (e) {

	}


	// Closing the connection
	console.log("Done seeding database");
	await closeConnection();
};

main().catch(console.log);
