import { GraphQLError } from "graphql";
import * as mongoUserFunctions from "../utils/mongoDB/mongoUserFunctions.js";
import * as redisFunctions from "../utils/redisFunctions.js";
import validation from "../utils/validation/rootValidation.js";

import { hourInSeconds } from "../utils/constants.js";

const userResolvers = {
	Query: {
		getUser: async (_, args) => {
			// Validate the user ID
			try {
				args._id = validation.checkUUID(args._id, "User ID");
			} catch (e) {
				throw new GraphQLError(e, { extensions: { code: "BAD_USER_INPUT" } });
			}

			// Check if the user is in Redis
			const redisKey = `user_${args._id}`;
			if (await redisFunctions.checkKeyExists(redisKey))
				return await redisFunctions.getDataFromRedis(redisKey);
			// Otherwise get the user from the database and cache them
			else {
				try {
					const user = await mongoUserFunctions.getUserByID(args._id);
					await redisFunctions.storeDataInRedis(redisKey, user, hourInSeconds);
					return user;
				} catch (e) {
					throw new GraphQLError(e, {
						extensions: { code: "INTERNAL_SERVER_ERROR" },
					});
				}
			}
		},

		getUserByAuthID: async (_, args) => {
			// Validate the user authID
			try {
				args.authID = validation.checkUserAuthID(args.authID, "Auth ID");
			} catch (e) {
				throw new GraphQLError(e, { extensions: { code: "BAD_USER_INPUT" } });
			}

			try {
				const user = await mongoUserFunctions.getUserByAuthID(args.authID);
				return user;
			} catch (e) {
				throw new GraphQLError(e, {
					extensions: { code: "INTERNAL_SERVER_ERROR" },
				});
			}
		},

		getAllUsers: async (_, args) => {
			try {
				const users = await mongoUserFunctions.getAllUsers();
				return users;
			} catch (e) {
				throw new GraphQLError(e, {
					extensions: { code: "INTERNAL_SERVER_ERROR" },
				});
			}
		},
	},
	Mutation: {
		createUser: async (_, args) => {
			// Validate the user arguments
			try {
				args.authID = validation.checkUserAuthID(args.authID, "Auth ID");
				args.username = validation.checkUserUsername(args.username);
				args.firstName = validation.checkUserName(args.firstName);
				args.lastName = validation.checkUserName(args.lastName);
			} catch (e) {
				throw new GraphQLError(e, { extensions: { code: "BAD_USER_INPUT" } });
			}

			// Add the user to the database and cache it
			try {
				const user = await mongoUserFunctions.createUser(args);
				await redisFunctions.storeDataInRedis(
					`user_${user._id}`,
					user,
					hourInSeconds
				);
				return user;
			} catch (e) {
				throw new GraphQLError(e, {
					extensions: { code: "INTERNAL_SERVER_ERROR" },
				});
			}
		},

		deleteUser: async (_, args) => {
			// Validate the user arguments
			try {
				args.userID = validation.checkUUID(args.userID, "User ID");
			} catch (e) {
				throw new GraphQLError(e, { extensions: { code: "BAD_USER_INPUT" } });
			}

			// Delete the user from the database and the cache
			try {
				const user = await mongoUserFunctions.deleteUser(args.userID);
				await redisFunctions.deleteDataFromRedis(`user_${args.userID}`);
				return user;
			} catch (e) {
				throw new GraphQLError(e, {
					extensions: { code: "INTERNAL_SERVER_ERROR" },
				});
			}
		},

		modifyUser: async (_, args) => {
			// Validate the user arguments
			try {
				args.userID = validation.checkUUID(args.userID, "User ID");
				if (args.username)
					args.username = validation.checkUserUsername(args.username);
				if (args.firstName)
					args.firstName = validation.checkUserName(args.firstName);
				if (args.lastName)
					args.lastName = validation.checkUserName(args.lastName);
			} catch (e) {
				throw new GraphQLError(e, { extensions: { code: "BAD_USER_INPUT" } });
			}

			// Modify the user in the database
			try {
				const user = await mongoUserFunctions.modifyUser(args.userID, args);
				await redisFunctions.deleteDataFromRedis(`user_${args.userID}`);
				await redisFunctions.storeDataInRedis(
					`user_${user._id}`,
					user,
					hourInSeconds
				);
				return user;
			} catch (e) {
				throw new GraphQLError(e, {
					extensions: { code: "INTERNAL_SERVER_ERROR" },
				});
			}
		},
	},
	User: {
		teams: async (parentValue) => {
			const userTeams = await mongoUserFunctions.getTeamsByUserID(
				parentValue._id
			);
			return userTeams;
		},
		assignedTasks: async (parentValue) => {
			const userTasks = await mongoUserFunctions.getAssignedTasksByUserID(
				parentValue._id
			);
			return userTasks;
		},
	},
};

export default userResolvers;
