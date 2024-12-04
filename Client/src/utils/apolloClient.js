import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const apolloClient = new ApolloClient({
	link: new HttpLink({ uri: "http://localhost:4000/" }),
	fetchOptions: {
		mode: "no-cors",
	},
	cache: new InMemoryCache(),
});

export default apolloClient;
