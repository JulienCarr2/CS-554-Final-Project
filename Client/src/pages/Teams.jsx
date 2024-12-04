import React, { useEffect, useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import NotAuthenticated from "../components/NotAuthenticated";
import { Box, Stack } from "@mui/system";
import {
	List,
	ListItemButton,
	ListItemText,
	ListSubheader,
	TextField,
} from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import { useSelector } from "react-redux";

function Teams(props) {
	const navigate = useNavigate();

	const getUserByAuthID = gql`
		query Query($authID: ID!) {
			getUserByAuthID(authID: $authID) {
				_id
				teams {
					_id
					name
					description
				}
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
	const { data, loading, error, refetch } = useQuery(getUserByAuthID, {
		variables: { authID: authId },
	});

	// Redux selector
	const { newTeam } = useSelector((state) => state.user);

	// Refresh on new task
	useEffect(() => {
		refetch();
	}, [newTeam]);

	// If the user is not authenticated, display a message
	if (!isAuthenticated && !isLoading) return <NotAuthenticated />;

	const team = (teamId) => {
		try {
			navigate(`/teams/${teamId}`);
		} catch (e) {
			console.log(e);
		}
	};

	if (loading) {
		return (
			<div className="task-details-div">
				<h1>Loading</h1>
			</div>
		);
	}

	if (error) {
		return (
			<div className="task-details-div">
				<h1>{error.message}</h1>
			</div>
		);
	}

	return (
		<div className="team-details-div">
			<h1 className="rocco-heading">Create New Team</h1>
			<Stack>
				<button
					type="submit"
					className="rocco-button"
					onClick={() => navigate("/teams/create")}
				>
					Create Team
				</button>
				<Box
					sx={{
						mt: 1,
						width: "100%",
						border: 1,
						borderRadius: 1,
						borderColor: "primary.main",
					}}
				>
					<List>
						<ListSubheader>Teams:</ListSubheader>
						{data.getUserByAuthID.teams.map((teamInfo) => {
							return (
								<ListItemButton
									component={"li"}
									role={"listitem"}
									onClick={() => team(teamInfo._id)}
									key={teamInfo._id}
								>
									<ListItemText
										primary={teamInfo.name}
										secondary={teamInfo.description}
									/>
								</ListItemButton>
							);
						})}
					</List>
				</Box>
			</Stack>
		</div>
	);
}

export default Teams;
