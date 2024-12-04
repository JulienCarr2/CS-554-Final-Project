import { gql, useMutation } from "@apollo/client";
import { TextField } from "@mui/material";
import Box from "@mui/material/Box";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { newTeam } from "../actions";
import NotAuthenticated from "../components/NotAuthenticated";
import { useCurrentUserID } from "../utils/auth";
import validation from "../utils/validation/rootValidation.js";

// Mutation to create a team
const CREATE_TEAM = gql`
	mutation Mutation(
		$userId: ID!
		$teamName: String!
		$teamDescription: String
	) {
		createTeam(
			userID: $userId
			teamName: $teamName
			teamDescription: $teamDescription
		) {
			_id
		}
	}
`;

let formError = false;
const CreateTeam = () => {
	// Get the current user's auth0 id
	const {
		currentUserID,
		isAuthenticated,
		isLoading: authIsLoading,
	} = useCurrentUserID();

	// Create a navigate function
	const navigate = useNavigate();

	// Redux dispatch
	const dispatch = useDispatch();

	// Mutation to create a team
	const [createTeam, { loading: createIsLoading, error: createError }] =
		useMutation(CREATE_TEAM);

	// Event handler for creating a team
	const handleSubmit = async (e) => {
		// Prevent default behavior of form
		e.preventDefault();

		// Get values from the form
		let { teamName, teamDescription } = e.target.elements;
		try {
			// Validate the inputs
			setErrorMessage(null);
			teamName = validation.checkTeamName(teamName.value);
			teamDescription = teamDescription.value
				? validation.checkTeamDescription(teamDescription.value)
				: teamDescription.value;
			createTeam({
				variables: {
					userId: currentUserID,
					teamName,
					teamDescription,
				},
			}).then((response) => {
				const teamID = response.data?.createTeam?._id ?? "";
				dispatch(newTeam());
				navigate(`/teams/${teamID}`);
			});
		} catch (e) {
			console.log(e);
			setErrorMessage(`${e}`);
		}
	};

	const [errorMessage, setErrorMessage] = useState(null);

	// If the user is not authenticated, display a message
	if (!isAuthenticated && !authIsLoading) return <NotAuthenticated />;

	// Loading
	if (createIsLoading || authIsLoading) {
		return (
			<h1 className="rocco-heading text-red-500" style={{ marginTop: 120 }}>
				Loading...
			</h1>
		);
	}

	return (
		<div className="profile">
			<h1 className="rocco-heading">Create New Team</h1>
			<Box
				component="form"
				sx={{
					"& .MuiTextField-root": { m: 1, width: "25ch" },
				}}
				noValidate
				autoComplete="off"
				onSubmit={handleSubmit}
			>
				<div>
					<TextField required type="text" name="teamName" label="Name" />
					<TextField type="text" name="teamDescription" label="Description" />
				</div>
				{errorMessage ? (
					<p className="text-red-600 text-center mb-3">{errorMessage}</p>
				) : null}
				<button type="submit" className="rocco-button">
					Create Team
				</button>
			</Box>
		</div>
	);
};

export default CreateTeam;
