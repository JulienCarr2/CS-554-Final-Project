import { gql, useMutation, useQuery } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";
import React, { useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import {
	Alert,
	Button,
	Divider,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import Box from "@mui/material/Box";

function Profile(props) {
	const [formData, setFormData] = useState({
		username: "",
		firstName: "",
		lastName: "",
	});
	const [errorMessage, setErrorMessage] = useState("");

	const handleChange = (e) => {
		setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const getUserByAuthID = gql`
		query Query($authID: ID!) {
			getUserByAuthID(authID: $authID) {
				_id
				username
				firstName
				lastName
			}
		}
	`;

	const modifyUser = gql`
		mutation Mutation(
			$userId: ID!
			$username: String
			$firstName: String
			$lastName: String
		) {
			modifyUser(
				userID: $userId
				username: $username
				firstName: $firstName
				lastName: $lastName
			) {
				_id
				username
				firstName
				lastName
			}
		}
	`;

	// In order to access the user, you can use user here once you check if it's loaded and authenticated. (Authenticated meaning logged in.)
	const { user, isAuthenticated, isLoading } = useAuth0();

	// This was done before the changes to how we fetched the information lately, I have not touched it, since I didn't want to break anything.
	// To better understand the fetching refer to utils/auth.js to see how it's done behind the scenes, but this is done manually here, in the same way.
	let authId;
	if (isAuthenticated) {
		authId = user.sub;
	}

	// Query Usage to fetch based on authId
	const { data, loading, error } = useQuery(getUserByAuthID, {
		variables: { authID: authId },
	});

	// Mutate function
	const [mutateFunction] =
		useMutation(modifyUser);

	// Form Submission handler done by Facundo
	const submitForm = async (e) => {
		e.preventDefault();
		setErrorMessage(null);

		let usernameSubmit = data.getUserByAuthID.username;
		let firstSubmit = data.getUserByAuthID.firstName;
		let lastSubmit = data.getUserByAuthID.lastName;
		if (!(formData.username.trim() === "")) {
			usernameSubmit = formData.username.trim();
		}
		if (!(formData.firstName.trim() === "")) {
			firstSubmit = formData.firstName.trim();
		}
		if (!(formData.lastName.trim() === "")) {
			lastSubmit = formData.lastName.trim();
		}

		document.getElementById("username").value = "";
		document.getElementById("firstName").value = "";
		document.getElementById("lastName").value = "";

		try {

			if (usernameSubmit.length > 30) {
				throw new Error("Username must be less than 30 characters.");
			}
			if (firstSubmit.length > 20) {
				throw new Error("First Name must be less than 20 characters.");
			}
			if (lastSubmit.length > 20) {
				throw new Error("Last Name must be less than 20 characters.");
			}

			mutateFunction({
				variables: {
					userId: data.getUserByAuthID._id,
					username: usernameSubmit,
					firstName: firstSubmit,
					lastName: lastSubmit,
				},
			});
		} catch(e) {
			setErrorMessage(`${e}`);
		}
	};

	if (loading || isLoading) {
		return (
			<div className="profile">
				<h1>Loading</h1>
			</div>
		);
	}

	if (!isAuthenticated) {
		return (
			<div className="profile">
				<h1>Please Login before accessing this page!</h1>
			</div>
		);
	}

	if (error) {
		return (
			<div className="profile">
				<h1>Error: 400</h1>
			</div>
		);
	}

	return (
		<div className="profile">
			<div className="input-selection">
				<h1 className="rocco-heading">User Profile</h1>
				<Alert severity="info">User Information</Alert>
				<Box
					sx={{
						mt: 1,
						width: "100%",
						border: 1,
						borderRadius: 1,
						borderColor: "primary.main",
					}}
				>
					<List sx={{ width: "100%", bgcolor: "background.paper" }}>
						<ListItem>
							<ListItemText
								primary="Username"
								secondary={data.getUserByAuthID.username}
							/>
						</ListItem>
						<Divider component="li" />
						<ListItem>
							<ListItemText
								primary="First Name"
								secondary={data.getUserByAuthID.firstName}
							/>
						</ListItem>
						<Divider component="li" />
						<ListItem>
							<ListItemText
								primary="Last Name"
								secondary={data.getUserByAuthID.lastName}
							/>
						</ListItem>
					</List>
				</Box>

				{/* Example Form based on MUI documentation for TextField */}
				<Alert severity="warning" sx={{ mt: 2 }}>
					Edit Your Information Below!
				</Alert>
				<Box
					component="form"
					sx={{
						"& .MuiTextField-root": { m: 1, width: "25ch" },
					}}
					noValidate
					autoComplete="off"
					onSubmit={submitForm}
				>
					{/* onKeyDown solution provided by https://stackoverflow.com/questions/70264223/mui-textfield-how-to-prevent-form-from-being-submitted to handle form submission by enter key. */}
					<Stack>
						<Stack direction="row">
						<TextField
							onChange={(e) => handleChange(e)}
							id="username"
							name="username"
							placeholder={data.getUserByAuthID.username}
							label="Username"
						/>
						<TextField
							onChange={(e) => handleChange(e)}
							id="firstName"
							name="firstName"
							placeholder={data.getUserByAuthID.firstName}
							label="First Name"
						/>
						<TextField
							onChange={(e) => handleChange(e)}
							id="lastName"
							name="lastName"
							placeholder={data.getUserByAuthID.lastName}
							label="Last Name"
						/>
						</Stack>
					<button type="submit" className="rocco-button">
						Submit
					</button>
					</Stack>
				</Box>
			</div>
			{errorMessage ? (
				<Alert severity="error" sx={{ mt: 2 }}>
					{errorMessage}
				</Alert>
			) : null}
		</div>
	);
}

export default Profile;
