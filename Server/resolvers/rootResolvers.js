import taskResolvers from "./taskResolvers.js";
import teamResolvers from "./teamResolvers.js";
import userResolvers from "./userResolvers.js";

const rootResolvers = {
	Query: {
		...taskResolvers.Query,
		...teamResolvers.Query,
		...userResolvers.Query,
	},
	Mutation: {
		...taskResolvers.Mutation,
		...teamResolvers.Mutation,
		...userResolvers.Mutation,
	},
	Task: {
		...taskResolvers.Task,
	},
	Team: {
		...teamResolvers.Team,
	},
	User: {
		...userResolvers.User,
	},
};

export default rootResolvers;
