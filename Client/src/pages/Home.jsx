import { gql, useQuery } from "@apollo/client";
import { faker } from "@faker-js/faker";
import React, { useEffect, useState } from "react";
import { useCurrentUserID } from "../utils/auth";

// Query to get the current user's first name
const GET_FIRST_NAME = gql`
	query Query($id: ID!) {
		getUser(_id: $id) {
			firstName
		}
	}
`;

const Home = () => {
	// State for the adjective
	const [adjective, setAdjective] = useState("complete");

	// useEffect to change the adjective
	useEffect(() => {
		const interval = setInterval(() => {
			setAdjective(faker.word.verb());
		}, 1000); // Change word every second or 1000ms
		return () => clearInterval(interval); // Clear the interval to prevent memory leaks
	}, []);

	// Get the current user's auth0 id
	const {
		currentUserID,
		isAuthenticated,
		isLoading: authIsLoading,
	} = useCurrentUserID();

	// Get the first name if the user is authenticated
	const { loading: userLoading, data: userData } = useQuery(GET_FIRST_NAME, {
		variables: { id: currentUserID },
	});
	const firstName = userData?.getUser.firstName;

	// Loading
	if (authIsLoading || userLoading)
		return (
			<h1 className="rocco-heading" style={{ marginTop: 120 }}>
				Loading...
			</h1>
		);

	return (
		<div className="flex justify-center items-center min-h-screen">
			<div className="rocco-slide-fade-in">
				<h1 className="text-6xl font-bold mb-3">
					Welcome{firstName ? " " : ""}
					<span className="text-sky-200">{firstName}</span>
				</h1>
				<p className="text-2xl">Let's {adjective} together</p>
			</div>
		</div>
	);
};

export default Home;
