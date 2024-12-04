import React, { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import NotAuthenticated from "../components/NotAuthenticated";
import { useCurrentUserID } from "../utils/auth";
import { useAuth0 } from "@auth0/auth0-react";
import { Stack } from "@mui/system";
import {
	Avatar,
	List,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	ListSubheader,
} from "@mui/material";
import { useSelector } from "react-redux";
import { Badge } from "@mui/base";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";
import Looks4Icon from "@mui/icons-material/Looks4";
import Looks5Icon from "@mui/icons-material/Looks5";

function Tasks(props) {
	const navigate = useNavigate();

	const task = (taskId) => {
		try {
			navigate(`/tasks/task/${taskId}`);
		} catch (e) {
			console.log(e);
		}
	};

	/* Facundo's Filter (Removed because bug, but works well after selecting a filter. */

	// const priorityAsc = (a, b) => {
	// 	const priorityA = Number(a.priority);
	// 	const priorityB = Number(b.priority);

	// 	let comparison = 0;
	// 	if (priorityA > priorityB) {
	// 		comparison = 1;
	// 	} else if (priorityA < priorityB) {
	// 		comparison = -1;
	// 	}
	// 	return comparison;
	// };
	// const priorityDesc = (a, b) => {
	// 	const priorityA = Number(a.priority);
	// 	const priorityB = Number(b.priority);

	// 	let comparison = 0;
	// 	if (priorityA > priorityB) {
	// 		comparison = 1;
	// 	} else if (priorityA < priorityB) {
	// 		comparison = -1;
	// 	}
	// 	return comparison * -1;
	// };
	// const nameAsc = (a, b) => {
	// 	const nameA = a.name.toUpperCase();
	// 	const nameB = b.name.toUpperCase();
	// 	let comparison = 0;
	// 	if (nameA > nameB) {
	// 		comparison = 1;
	// 	} else if (nameA < nameB) {
	// 		comparison = -1;
	// 	}
	// 	return comparison;
	// };
	// const nameDesc = (a, b) => {
	// 	const nameA = a.name.toUpperCase();
	// 	const nameB = b.name.toUpperCase();

	// 	let comparison = 0;
	// 	if (nameA > nameB) {
	// 		comparison = 1;
	// 	} else if (nameA < nameB) {
	// 		comparison = -1;
	// 	}
	// 	return comparison * -1;
	// };
	// const dateAsc = (a, b) => {
	// 	const dateA = a.dueDate.split("/");
	// 	const dayA = Number(dateA[0]);
	// 	const monthA = Number(dateA[1]);
	// 	const yearA = Number(dateA[2]);
	// 	const dateB = b.dueDate.split("/");
	// 	const dayB = Number(dateB[0]);
	// 	const monthB = Number(dateB[1]);
	// 	const yearB = Number(dateB[2]);

	// 	let comparison = 0;

	// 	if (yearA > yearB) {
	// 		comparison = 1;
	// 	} else if (yearA < yearB) {
	// 		comparison = -1;
	// 	} else {
	// 		if (monthA > monthB) {
	// 			comparison = 1;
	// 		} else if (monthA < monthB) {
	// 			comparison = -1;
	// 		} else {
	// 			if (dayA > dayB) {
	// 				comparison = 1;
	// 			} else if (dayA < dayB) {
	// 				comparison = -1;
	// 			}
	// 		}
	// 	}
	// 	return comparison;
	// };
	// const dateDesc = (a, b) => {
	// 	const dateA = a.dueDate.split("/");
	// 	const dayA = Number(dateA[0]);
	// 	const monthA = Number(dateA[1]);
	// 	const yearA = Number(dateA[2]);
	// 	const dateB = b.dueDate.split("/");
	// 	const dayB = Number(dateB[0]);
	// 	const monthB = Number(dateB[1]);
	// 	const yearB = Number(dateB[2]);

	// 	let comparison = 0;

	// 	if (yearA > yearB) {
	// 		comparison = 1;
	// 	} else if (yearA < yearB) {
	// 		comparison = -1;
	// 	} else {
	// 		if (monthA > monthB) {
	// 			comparison = 1;
	// 		} else if (monthA < monthB) {
	// 			comparison = -1;
	// 		} else {
	// 			if (dayA > dayB) {
	// 				comparison = 1;
	// 			} else if (dayA < dayB) {
	// 				comparison = -1;
	// 			}
	// 		}
	// 	}
	// 	return comparison * -1;
	// };

	// const setOrder = () => {
	// 	setToReturn(
	// 		projectsData &&
	// 			projectsData.map((project) => {
	// 				return (
	// 					<button
	// 						onClick={() => task(project._id)}
	// 						key={project.id}
	// 						className="project-button"
	// 					>
	// 						<h2 key={`Name${project.id}`} className="project-info">
	// 							{project.name}
	// 						</h2>
	// 						<h3 key={`Priority${project.id}`} className="project-info">
	// 							Priority: {project.priority}
	// 						</h3>
	// 						<h3 key={`Deadline${project.id}`} className="project-info">
	// 							Deadline: {project.dueDate}
	// 						</h3>
	// 					</button>
	// 				);
	// 			})
	// 	);
	// };

	// const changeFilter = () => {
	// 	let filter = "Name ^";
	// 	if (
	// 		document.getElementById("projectFilter") &&
	// 		document.getElementById("projectFilter").value
	// 	) {
	// 		filter = document.getElementById("projectFilter").value;
	// 	}
	// 	if (projectsData.length > 0) {
	// 		let tempArr = [...projectsData];
	// 		switch (filter) {
	// 			case "Priority ^":
	// 				projectsData = tempArr.sort(priorityAsc);
	// 				break;
	// 			case "Priority v":
	// 				projectsData = tempArr.sort(priorityDesc);
	// 				break;
	// 			case "Name ^":
	// 				projectsData = tempArr.sort(nameAsc);
	// 				break;
	// 			case "Name v":
	// 				projectsData = tempArr.sort(nameDesc);
	// 				break;
	// 			case "Deadline ^":
	// 				projectsData = tempArr.sort(dateAsc);
	// 				break;
	// 			case "Deadline v":
	// 				projectsData = tempArr.sort(dateDesc);
	// 				break;

	// 			default:
	// 				break;
	// 		}
	// 		setOrder();
	// 	}
	// };

	const getUserByAuthID = gql`
		query Query($authID: ID!) {
			getUserByAuthID(authID: $authID) {
				_id
				assignedTasks {
					name
					description
					_id
					priority
					dueDate
					completed
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
	const { newTask, deletedTask } = useSelector((state) => state.user);

	// Refresh on new task
	useEffect(() => {
		refetch();
	}, [newTask, deletedTask]);

	// If the user is not authenticated, display a message
	if (!isAuthenticated && !isLoading) return <NotAuthenticated />;

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

	const priorityIcon = (priority) => {
		if (priority == 1) {
			return <LooksOneIcon />;
		}
		if (priority == 2) {
			return <LooksTwoIcon />;
		}
		if (priority == 3) {
			return <Looks3Icon />;
		}
		if (priority == 4) {
			return <Looks4Icon />;
		}
		if (priority == 5) {
			return <Looks5Icon />;
		}
	};

	return (
		<div className="projects-div">
			<Stack>
				<h1 className="rocco-heading">Assigned Tasks</h1>
				{/* <div className="filter-div">
				<select
					name="projectFilter"
					id="projectFilter"
					className="filterItem"
					onChange={() => changeFilter()}
				>
					<option value="Name ^">Name ^</option>
					<option value="Name v">Name v</option>
					<option value="Priority ^">Priority ^</option>
					<option value="Priority v">Priority v</option>
					<option value="Deadline ^">Deadline ^</option>
					<option value="Deadline v">Deadline v</option>
				</select>
			</div> */}
				<List>
					<ListSubheader>Tasks</ListSubheader>
					{data.getUserByAuthID.assignedTasks.map((taskInfo) => {
						return taskInfo.completed ? null : (
							<ListItemButton
								component={"li"}
								role={"listitem"}
								onClick={() => task(taskInfo._id)}
								key={taskInfo._id}
							>
								<ListItemAvatar>
									<Avatar>{priorityIcon(taskInfo.priority)}</Avatar>
								</ListItemAvatar>
								<ListItemText
									primary={taskInfo.name}
									secondary={taskInfo.description}
								/>
							</ListItemButton>
						);
					})}
				</List>
			</Stack>
		</div>
	);
}
export default Tasks;
