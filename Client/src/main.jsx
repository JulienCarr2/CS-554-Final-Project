import { ApolloProvider } from "@apollo/client";
import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "../src/App.jsx";
import "./index.css";
import { auth0Config } from "./settings.js";
import store from "./store";
import apolloClient from "./utils/apolloClient.js";

ReactDOM.createRoot(document.getElementById("root")).render(
	<Auth0Provider
		domain={auth0Config.domain}
		clientId={auth0Config.clientId}
		authorizationParams={{
			redirect_uri: window.location.origin,
		}}
	>
		<Provider store={store}>
			<ApolloProvider client={apolloClient}>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</ApolloProvider>
		</Provider>
	</Auth0Provider>
);
