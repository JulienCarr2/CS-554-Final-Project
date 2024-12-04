import { GraphQLError } from "graphql";
import * as mongoTaskFunctions from "../utils/mongoDB/mongoTaskFunctions.js";
import * as redisFunctions from "../utils/redisFunctions.js";
import validation from "../utils/validation/rootValidation.js";

import { hourInSeconds } from "../utils/constants.js";

const taskResolvers = {
	Query: {
		getTask: async (_, args) => {
			// Validate the task ID
			try {
				args._id = validation.checkUUID(args._id, "Task ID");
			} catch (e) {
				throw new GraphQLError(e, { extensions: { code: "BAD_USER_INPUT" } });
			}

			// Check if the task is in Redis
			const redisKey = `task_${args._id}`;
			if (await redisFunctions.checkKeyExists(redisKey))
				return await redisFunctions.getDataFromRedis(redisKey);
			// Otherwise get the task from the database and cache them
			else {
				try {
					const task = await mongoTaskFunctions.getTaskByID(args._id);
					await redisFunctions.storeDataInRedis(redisKey, task, hourInSeconds);
					return task;
				} catch (e) {
					throw new GraphQLError(e, {
						extensions: { code: "INTERNAL_SERVER_ERROR" },
					});
				}
			}
		},

		getFullProject: async (_, args) => {
			// NOTE: this is only used for the sidebar.
			// Validate the root ID
			try {
				args.rootID = validation.checkUUID(args.rootID, "Project Root ID");
			} catch (e) {
				throw new GraphQLError(e, { extensions: { code: "BAD_USER_INPUT" } });
			}

			// Check if the task is in Redis
			const redisKey = `project_${args.rootID}`;
			if (await redisFunctions.checkKeyExists(redisKey))
				return await redisFunctions.getDataFromRedis(redisKey, true);
			// Otherwise get the task from the database and cache them
			else {
				try {
					const projectTasks = await mongoTaskFunctions.getTaskByRootID(
						args.rootID
					);
					await redisFunctions.storeDataInRedis(
						redisKey,
						projectTasks,
						hourInSeconds
					);
					return projectTasks;
				} catch (e) {
					throw new GraphQLError(e, {
						extensions: { code: "INTERNAL_SERVER_ERROR" },
					});
				}
			}
		},
	},
	Mutation: {
		createTask: async (_, args) => {
			// Validate the task arguments
			try {
				args.userID = validation.checkUUID(args.userID, "User ID");
				args.teamID = validation.checkUUID(args.teamID, "Team ID");
				args.taskName = validation.checkTaskName(args.taskName);
				if (args.taskDescription)
					args.taskDescription = validation.checkTaskDescription(
						args.taskDescription
					);
				if (args.parentTaskID)
					args.parentTaskID = validation.checkUUID(
						args.parentTaskID,
						"Parent ID"
					);
				args.taskDueDate = validation.checkTaskDueDate(args.taskDueDate);
				args.taskPriority = validation.checkTaskPriority(args.taskPriority);
			} catch (e) {
				throw new GraphQLError(e, { extensions: { code: "BAD_USER_INPUT" } });
			}

			// Add the task to the database and cache it
			try {
				const task = await mongoTaskFunctions.createTask(
					args.userID,
					args.teamID,
					args
				);
				await redisFunctions.storeDataInRedis(
					`task_${task._id}`,
					task,
					hourInSeconds
				);
				await redisFunctions.deleteDataFromRedis(`team_${args.teamID}`);
				await redisFunctions.deleteDataFromRedis(`project_${task.rootID}`);
				return task;
			} catch (e) {
				throw new GraphQLError(e, {
					extensions: { code: "INTERNAL_SERVER_ERROR" },
				});
			}
		},

		async deleteTask(_, args) {
			// Validate the task arguments
			try {
				args.taskID = validation.checkUUID(args.taskID, "Task ID");
				args.UserID = validation.checkUUID(args.userID, "User ID");
			} catch (e) {
				throw new GraphQLError(e, { extensions: { code: "BAD_USER_INPUT" } });
			}

			// Delete the task from the database and the cache
			try {
				const task = await mongoTaskFunctions.deleteTask(
					args.taskID,
					args.userID
				);
				await redisFunctions.deleteDataFromRedis(`task_${args.taskID}`);
				await redisFunctions.deleteDataFromRedis(`team_${task.teamID}`);
				console.log(task);
				await redisFunctions.deleteDataFromRedis(`project_${args.rootID}`);

				for (const subtaskID of task.subtaskIDs) {
					// recursively delete all subtasks of deleted tasks
					args.taskID = subtaskID;
					await this.deleteTask(_, args);
				}

				return task;
			} catch (e) {
				throw new GraphQLError(e, {
					extensions: { code: "INTERNAL_SERVER_ERROR" },
				});
			}
		},

		modifyTask: async (_, args) => {
			// Validate the task arguments
			try {
				args.taskID = validation.checkUUID(args.taskID, "Task ID");
				args.userID = validation.checkUUID(args.userID, "User ID");
				if (args.name) args.name = validation.checkTaskName(args.name);
				if (args.description)
					args.description = validation.checkTaskDescription(args.description);
				if (args.dueDate)
					args.dueDate = validation.checkTaskDueDate(args.dueDate);
				if (args.priority)
					args.priority = validation.checkTaskPriority(args.priority);
				if (args.parentID)
					args.parentID = validation.checkUUID(args.parentID, "Parent ID");
				if (args.rootID)
					args.rootID = validation.checkUUID(args.rootID, "Root ID");
				if (args.teamID)
					args.teamID = validation.checkUUID(args.teamID, "Team ID");
				if (args.completed)
					args.completed = validation.checkTaskCompleted(args.completed);
			} catch (e) {
				throw new GraphQLError(e, { extensions: { code: "BAD_USER_INPUT" } });
			}

			// Modify the task in the database
			try {
				const task = await mongoTaskFunctions.modifyTask(
					args.taskID,
					args.userID,
					args
				);
				await redisFunctions.deleteDataFromRedis(`task_${args.taskID}`);
				await redisFunctions.deleteDataFromRedis(`team_${task.teamID}`);
				await redisFunctions.storeDataInRedis(
					`task_${task._id}`,
					task,
					hourInSeconds
				);
				await redisFunctions.deleteDataFromRedis(`project_${args.rootID}`);
				return task;
			} catch (e) {
				throw new GraphQLError(e, {
					extensions: { code: "INTERNAL_SERVER_ERROR" },
				});
			}
		},

		assignTask(_, args) {
			// Validate the task arguments
			try {
				args.taskID = validation.checkUUID(args.taskID, "Task ID");
				args.userID = validation.checkUUID(args.userID, "User ID");
				args.assignedUserID = validation.checkUUID(
					args.assignedUserID,
					"Assigned ID"
				);
			} catch (e) {
				throw new GraphQLError(e, { extensions: { code: "BAD_USER_INPUT" } });
			}

			// Assign the task to the user in the database
			try {
				return mongoTaskFunctions.assignTaskToUser(args.taskID, args.userID);
			} catch (e) {
				throw new GraphQLError(e, {
					extensions: { code: "INTERNAL_SERVER_ERROR" },
				});
			}
		},
	},
	Task: {
		subtasks: async (parentValue) => {
			return await mongoTaskFunctions.getSubtasksFromTask(parentValue._id);
		},
		parent: async (parentValue) => {
			return await mongoTaskFunctions.getParentFromTask(parentValue._id);
		},
		root: async (parentValue) => {
			return await mongoTaskFunctions.getRootTask(parentValue._id);
		},
		users: async (parentValue) => {
			return await mongoTaskFunctions.assignedUsersFromTask(parentValue._id);
		},
		team: async (parentValue) => {
			return await mongoTaskFunctions.getTeamFromTask(parentValue._id);
		},
		progress: async (parentValue) => {
			return await mongoTaskFunctions.getProgressFromTask(parentValue._id);
		},
	},
};

export default taskResolvers;
