import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { typeDefs } from "./typeDefs.js";
import rootResolvers from "./resolvers/rootResolvers.js";

const server = new ApolloServer({
	typeDefs,
	resolvers: rootResolvers,
});

const { url } = await startStandaloneServer(server, {
	listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
