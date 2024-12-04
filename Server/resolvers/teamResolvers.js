import { GraphQLError } from "graphql";
import * as mongoTeamFunctions from "../utils/mongoDB/mongoTeamFunctions.js";
import * as redisFunctions from "../utils/redisFunctions.js";
import validation from "../utils/validation/rootValidation.js";

import { hourInSeconds } from "../utils/constants.js";

const teamResolvers = {
	Query: {
		getTeam: async (_, args) => {
			// Validate the team ID
			try {
				args._id = validation.checkUUID(args._id, "Team ID");
			} catch (e) {
				throw new GraphQLError(e, { extensions: { code: "BAD_USER_INPUT" } });
			}

			// Check if the team is in Redis
			const redisKey = `team_${args._id}`;
			if (await redisFunctions.checkKeyExists(redisKey))
				return await redisFunctions.getDataFromRedis(redisKey);
			// Otherwise get the team from the database and cache them
			else {
				try {
					const team = await mongoTeamFunctions.getTeamByID(args._id);
					await redisFunctions.storeDataInRedis(redisKey, team, hourInSeconds);
					return team;
				} catch (e) {
					throw new GraphQLError(e, {
						extensions: { code: "INTERNAL_SERVER_ERROR" },
					});
				}
			}
		},
	},
	Mutation: {
		createTeam: async (_, args) => {
			// Validate the team arguments
			try {
				args.userID = validation.checkUUID(args.userID, "User ID");
				args.teamName = validation.checkTeamName(args.teamName);
				if (args.teamDescription)
					args.teamDescription = validation.checkTeamDescription(
						args.teamDescription
					);
			} catch (e) {
				throw new GraphQLError(e, { extensions: { code: "BAD_USER_INPUT" } });
			}

			// Add the team to the database and cache it
			try {
				const team = await mongoTeamFunctions.createTeam(args.userID, args);
				await redisFunctions.storeDataInRedis(
					`team_${team._id}`,
					team,
					hourInSeconds
				);
				return team;
			} catch (e) {
				throw new GraphQLError(e, {
					extensions: { code: "INTERNAL_SERVER_ERROR" },
				});
			}
		},

		deleteTeam: async (_, args) => {
			// Validate the team arguments
			try {
				args.teamID = validation.checkUUID(args.teamID, "Team ID");
				args.userID = validation.checkUUID(args.userID, "User ID");
			} catch (e) {
				throw new GraphQLError(e, { extensions: { code: "BAD_USER_INPUT" } });
			}

			// Delete the team from the database and the cache
			try {
				const team = await mongoTeamFunctions.deleteTeam(
					args.teamID,
					args.userID
				);
				await redisFunctions.deleteDataFromRedis(`team_${args.teamID}`);
				return team;
			} catch (e) {
				throw new GraphQLError(e, {
					extensions: { code: "INTERNAL_SERVER_ERROR" },
				});
			}
		},

		modifyTeam: async (_, args) => {
			// Validate the team arguments
			try {
				args.teamID = validation.checkUUID(args.teamID, "Team ID");
				args.userID = validation.checkUUID(args.userID, "User ID");
				if (args.name) args.name = validation.checkTeamName(args.name);
				if (args.description)
					args.description = validation.checkTeamDescription(args.description);
			} catch (e) {
				throw new GraphQLError(e, { extensions: { code: "BAD_USER_INPUT" } });
			}

			// Modify the team in the database
			try {
				const team = await mongoTeamFunctions.modifyTeam(
					args.teamID,
					args.userID,
					args
				);
				await redisFunctions.deleteDataFromRedis(`team_${args.teamID}`);
				await redisFunctions.storeDataInRedis(
					`team_${team._id}`,
					team,
					hourInSeconds
				);
				return team;
			} catch (e) {
				throw new GraphQLError(e, {
					extensions: { code: "INTERNAL_SERVER_ERROR" },
				});
			}
		},

		addUserToTeam: async (_, args) => {
			// Validate the team arguments
			try {
				args.teamID = validation.checkUUID(args.teamID, "Team ID");
				args.userID = validation.checkUUID(args.userID, "User ID");
				args.userToAddID = validation.checkUUID(args.userToAddID, "User ID");
			} catch (e) {
				throw new GraphQLError(e, { extensions: { code: "BAD_USER_INPUT" } });
			}

			// Add the user to the team in the database
			try {
				const team = await mongoTeamFunctions.addUserToTeam(
					args.teamID,
					args.userID,
					args.userToAddID
				);
				await redisFunctions.deleteDataFromRedis(`team_${args.teamID}`);
				await redisFunctions.storeDataInRedis(
					`team_${team._id}`,
					team,
					hourInSeconds
				);
				return team;
			} catch (e) {
				throw new GraphQLError(e, {
					extensions: { code: "INTERNAL_SERVER_ERROR" },
				});
			}
		},

		removeUserFromTeam: async (_, args) => {
			// Validate the team arguments
			try {
				args.teamID = validation.checkUUID(args.teamID, "Team ID");
				args.userID = validation.checkUUID(args.userID, "User ID");
				args.userToRemoveID = validation.checkUUID(args.userToRemoveID, "User ID");
				if (!await mongoTeamFunctions.checkUserIsAdmin(args.userID, args.teamID)) {
					throw new Error("User is not an admin on the given team.")
				}
			} catch (e) {
				throw new GraphQLError(e, { extensions: { code: "BAD_USER_INPUT" } });
			}

			try {
				const team = await mongoTeamFunctions.removeUserFromTeam(
					args.userToRemoveID,
					args.teamID,
				);
				await redisFunctions.deleteDataFromRedis(`team_${args.teamID}`);
				await redisFunctions.storeDataInRedis(
					`team_${team._id}`,
					team,
					hourInSeconds
				);
				return team;
			} catch (e) {
				throw new GraphQLError(e, {
					extensions: { code: "INTERNAL_SERVER_ERROR" },
				});
			}
		},

		setUserAsAdmin: async (_, args) => {
			// Validate the team arguments
			try {
				args.teamID = validation.checkUUID(args.teamID, "Team ID");
				args.userID = validation.checkUUID(args.userID, "User ID");
				args.userToSetID = validation.checkUUID(args.userToSetID, "User ID");
			} catch (e) {
				throw new GraphQLError(e, { extensions: { code: "BAD_USER_INPUT" } });
			}

			// Set the user as admin in the database
			try {
				const team = await mongoTeamFunctions.setUserAsAdmin(
					args.teamID,
					args.userID,
					args.userToSetID
				);
				await redisFunctions.deleteDataFromRedis(`team_${args.teamID}`);
				await redisFunctions.storeDataInRedis(
					`team_${team._id}`,
					team,
					hourInSeconds
				);
				return team;
			} catch (e) {
				throw new GraphQLError(e, {
					extensions: { code: "INTERNAL_SERVER_ERROR" },
				});
			}
		},
	},
	Team: {
		admins: async (parentValue) => {
			const admins = await mongoTeamFunctions.getTeamAdmins(parentValue._id);
			return admins;
		},
		nonAdminUsers: async (parentValue) => {
			const nonAdmins = await mongoTeamFunctions.getTeamNonAdmins(
				parentValue._id
			);
			return nonAdmins;
		},
		projects: async (parentValue) => {
			const projects = await mongoTeamFunctions.getTeamProjects(
				parentValue._id
			);
			return projects;
		},
	},
};

export default teamResolvers;
