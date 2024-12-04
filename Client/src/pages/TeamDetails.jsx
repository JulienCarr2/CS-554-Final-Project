import { gql, useMutation, useQuery } from "@apollo/client";
import {
	Alert,
	Divider,
	FormControl,
	FormHelperText,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	ListSubheader,
	MenuItem,
	Select,
	Stack,
	TextField,
} from "@mui/material";
import Box from "@mui/material/Box";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import NotAuthenticated from "../components/NotAuthenticated";
import { useCurrentUserID } from "../utils/auth";
import validation from "../utils/validation/rootValidation";

// Mutation to delete a team
const DELETE_TEAM = gql`
	mutation DeleteTeam($teamId: ID!, $userId: ID!) {
		deleteTeam(teamID: $teamId, userID: $userId) {
			_id
		}
	}
`;

function TeamDetails(props) {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	let id = useParams().teamId;

	// Get the current user's auth0 id
	const {
		currentUserID,
		isAuthenticated,
		isLoading: authIsLoading,
	} = useCurrentUserID();

	const getTeam = gql`
		query Query($id: ID!) {
			getTeam(_id: $id) {
				_id
				name
				description
				admins {
					_id
					username
				}
				nonAdminUsers {
					_id
					username
				}
				projects {
					_id
					name
				}
			}
		}
	`;

	const getAllUsers = gql`
		query Query {
			getAllUsers {
				_id
				username
			}
		}
	`;

	const addUserToTeam = gql`
		mutation Mutation($teamID: ID!, $userID: ID!, $userToAddID: ID!) {
			addUserToTeam(
				teamID: $teamID
				userID: $userID
				userToAddID: $userToAddID
			) {
				_id
			}
		}
	`;

	const modifyTeam = gql`
		mutation Mutation(
			$teamID: ID!
			$userID: ID!
			$teamName: String
			$teamDescription: String
		) {
			modifyTeam(
				teamID: $teamID
				userID: $userID
				teamName: $teamName
				teamDescription: $teamDescription
			) {
				_id
			}
		}
	`;

	const removeUserFromTeam = gql`
		mutation Mutation($teamID: ID!, $userID: ID!, $userToRemoveID: ID!) {
			removeUserFromTeam(
				teamID: $teamID
				userID: $userID
				userToRemoveID: $userToRemoveID
			) {
				_id
			}
		}
	`;

	const [mutateFunction, { mutateData, mutateLoading, mutateError }] =
		useMutation(addUserToTeam);

	const [
		editTeam,
		{ mutateData: editData, mutateLoading: editLoad, mutateError: editError },
	] = useMutation(modifyTeam);

	const [
		purgeFunction,
		{
			mutateData: purgeData,
			mutateLoading: purgeLoad,
			mutateError: purgeError,
		},
	] = useMutation(removeUserFromTeam);

	// Mutation to delete a team
	const [deleteTeam] = useMutation(DELETE_TEAM);

	const {
		data: usersData,
		loading: usersLoad,
		error: usersError,
	} = useQuery(getAllUsers);

	const { data, loading, error, refetch } = useQuery(getTeam, {
		variables: { id },
	});

	// Redux selector
	const { newTask, deletedTask } = useSelector((state) => state.user);

	// Refresh on new task
	useEffect(() => {
		refetch();
	}, [newTask, deletedTask]);

	const [user, setUser] = useState("");
	const [purge, setPurge] = useState("");
	const [isRequired, setRequired] = useState(false);

	const handleChange = (e) => {
		setUser(e.target.value);
	};

	const handlePurge = (e) => {
		setPurge(e.target.value);
	};

	const submitForm = async (e) => {
		// Prevent default behavior of form
		e.preventDefault();

		// Get values from the form
		let teamName = e.target.elements.teamName.value;
		let teamDescription = e.target.elements.teamDescription.value;

		if (!teamName || teamName.trim() === "") {
			teamName = data.getTeam.name;
		}
		if (!teamDescription || teamDescription.trim() === "") {
			teamDescription = data.getTeam.description;
		}

		teamName = validation.checkTeamName(teamName);
		teamDescription = validation.checkTeamDescription(teamDescription);

		try {
			editTeam({
				variables: {
					teamID: id,
					userID: currentUserID,
					teamName,
					teamDescription,
				},
			});
			navigate("/teams");
		} catch (e) {
			console.log(e);
		}
	};

	const handleSubmit = async (e) => {
		// Prevent default behavior of form
		e.preventDefault();

		// Get values from the form
		const userName = e.target.elements.userName.value;
		if (!userName) {
			setRequired(true);
		} else {
			setRequired(false);
			try {
				mutateFunction({
					variables: {
						teamID: id,
						userID: currentUserID,
						userToAddID: userName,
					},
				}).then(() => {
					navigate("/teams");
				});
			} catch (e) {
				console.log(e);
			}
		}
	};

	const handleDelete = async (e) => {
		// Prevent default behavior of form
		e.preventDefault();

		// Get values from the form
		const userName = e.target.elements.purgeName.value;
		if (!userName) {
			setRequired(true);
		} else {
			setRequired(false);
			try {
				purgeFunction({
					variables: {
						teamID: id,
						userID: currentUserID,
						userToRemoveID: userName,
					},
				}).then(() => {
					navigate("/teams");
				});
			} catch (e) {
				console.log(e);
			}
		}
	};

	// If the user is not authenticated, display a message
	if (!isAuthenticated && !authIsLoading) {
		return <NotAuthenticated />;
	}

	if (loading) {
		return (
			<div className="team-details-div">
				<h1>Loading</h1>
			</div>
		);
	}

	if (error)
		return (
			<div className="team-details-div">
				<h1>{error.message}</h1>
			</div>
		);

	return (
		<div className="team-details-div">
			<h1 className="rocco-heading">{data.getTeam.name}</h1>
			<h1 className="mb-5 py-2 text-2xl font-xl">Team Details</h1>
			<Stack>
				<Alert severity="info">Team Information</Alert>
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
								primary="Description"
								secondary={data.getTeam.description}
							/>
						</ListItem>
						<Divider component="li" />
						<ListItem>
							<ListItemText
								primary={"Admin Users:"}
								secondary={data.getTeam.admins.reduce((init, curr) => {
									return init + curr.username + "\n";
								}, "")}
							/>
						</ListItem>
						<Divider component="li" />
						<ListItem>
							<ListItemText
								primary={"Non-Admin Users:"}
								secondary={data.getTeam.nonAdminUsers.reduce((init, curr) => {
									return init + curr.username + "\n";
								}, "")}
							/>
						</ListItem>
						<Divider component="li" />
						<ListSubheader>Projects:</ListSubheader>
						{data.getTeam.projects.map((project) => {
							return (
								<ListItemButton
									component={"li"}
									role={"listitem"}
									onClick={() => navigate(`/tasks/task/${project._id}`)}
									key={project._id}
								>
									<h3 key={`Name${project._id}`} className="project-info">
										{project.name}
									</h3>
								</ListItemButton>
							);
						})}
					</List>
				</Box>
			</Stack>
			{data.getTeam.admins.map((adminId) => {
				if (adminId._id === currentUserID) {
					return (
						<Stack key="adminId._id">
							<button
								className="rocco-button"
								onClick={() => navigate(`/tasks/create/${id}`)}
							>
								Create Task
							</button>
							<Alert severity="warning" sx={{ mt: 2 }}>
								Add Users Below
							</Alert>
							<Box
								component="form"
								sx={{
									"& .MuiTextField-root": { m: 1, width: "25ch" },
								}}
								noValidate
								autoComplete="off"
								onSubmit={handleSubmit}
							>
								<Stack>
									<FormControl sx={{ m: 1, minWidth: 120 }}>
										<Select
											value={user}
											onChange={handleChange}
											name="userName"
											error={isRequired}
										>
											{usersData.getAllUsers.map((userData) => {
												if (
													data.getTeam.admins.reduce((a, c) => {
														return a || Object.values(c).includes(userData._id);
													}, false) ||
													data.getTeam.nonAdminUsers.reduce((a, c) => {
														return a || Object.values(c).includes(userData._id);
													}, false)
												) {
													return null;
												} else {
													return (
														<MenuItem key={userData._id} value={userData._id}>
															{userData.username}
														</MenuItem>
													);
												}
											})}
										</Select>
										<FormHelperText>Add a User Above</FormHelperText>
									</FormControl>
									<button type="submit" className="rocco-button">
										Add User
									</button>
								</Stack>
							</Box>
							<Alert severity="error" sx={{ mt: 2 }}>
								Remove a User Below.
							</Alert>

							<Box
								component="form"
								sx={{
									"& .MuiTextField-root": { m: 1, width: "25ch" },
								}}
								noValidate
								autoComplete="off"
								onSubmit={handleDelete}
							>
								<Stack>
									<FormControl sx={{ m: 1, minWidth: 120 }}>
										<Select
											value={purge}
											onChange={handlePurge}
											name="purgeName"
											error={isRequired}
										>
											{data.getTeam.nonAdminUsers.map((userData) => {
												return (
													<MenuItem key={userData._id} value={userData._id}>
														{userData.username}
													</MenuItem>
												);
											})}
										</Select>
										<FormHelperText>Remove a User Above</FormHelperText>
									</FormControl>
									<button type="submit" className="rocco-button">
										Remove User
									</button>
								</Stack>
							</Box>

							{/* Example Form based on MUI documentation for TextField */}
							<Alert severity="warning" sx={{ mt: 2 }}>
								Edit Your Information Below
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
								<div>
									{/* onKeyDown solution provided by https://stackoverflow.com/questions/70264223/mui-textfield-how-to-prevent-form-from-being-submitted to handle form submission by enter key. */}
									<TextField
										onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
										id="teamName"
										name="teamName"
										label="Name"
									/>
									<TextField
										onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
										id="teamDescription"
										name="teamDescription"
										label="Description"
									/>
								</div>
								<button type="submit" className="rocco-button">
									Edit Team
								</button>
							</Box>
							{/* Box for delete Team */}
							<Box
								component="form"
								sx={{
									"& .MuiTextField-root": { m: 1, width: "25ch" },
								}}
								noValidate
								autoComplete="off"
								onSubmit={submitForm}
							>
								<button
									className="rocco-button"
									onClick={() => {
										deleteTeam({
											variables: {
												teamId: id,
												userId: currentUserID,
											},
										}).then(() => {
											navigate("/teams");
										});
									}}
								>
									Delete Team
								</button>
							</Box>
						</Stack>
					);
				}
			})}
		</div>
	);
}

export default TeamDetails;
