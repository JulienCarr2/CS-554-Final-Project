import { gql, useMutation, useQuery } from "@apollo/client";
import {
	Alert,
	Divider,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	ListSubheader,
	TextField,
} from "@mui/material";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import { Stack } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { deletedTask } from "../actions";
import NotAuthenticated from "../components/NotAuthenticated";
import ProgressWheel from "../components/ProgressBar";
import SideBar from "../components/SideBar";
import TaskCompleted from "../components/TaskCompleted";
import { useCurrentUserID } from "../utils/auth";
import validation from "../utils/validation/rootValidation";

const drawerWidth = 240;

// Mutation to delete a task
const DELETE_TASK = gql`
	mutation Mutation($taskId: ID!, $userId: ID!, $rootId: ID!) {
		deleteTask(taskID: $taskId, userID: $userId, rootID: $rootId) {
			_id
		}
	}
`;

// Mutation to assign user to a task
const ASSIGN_TASK = gql`
	mutation Mutation($taskId: ID!, $userId: ID!, $assignedUserId: ID!) {
		assignTask(
			taskID: $taskId
			userID: $userId
			assignedUserID: $assignedUserId
		) {
			users {
				username
				_id
			}
		}
	}
`;

// Mutation to edit task
const EDIT_TASK = gql`
	mutation ModifyTask(
		$taskId: ID!
		$userId: ID!
		$taskName: String
		$taskDescription: String
		$taskDueDate: String
		$taskPriority: Int
	) {
		modifyTask(
			taskID: $taskId
			userID: $userId
			taskName: $taskName
			taskDescription: $taskDescription
			taskDueDate: $taskDueDate
			taskPriority: $taskPriority
		) {
			name
			description
			dueDate
			priority
		}
	}
`;

// Query to get all needed information about a task
const GET_TASK = gql`
	query Query($id: ID!) {
		getTask(_id: $id) {
			name
			description
			priority
			dueDate
			progress
			completed
			team {
				_id
				name
				admins {
					_id
					username
				}
				nonAdminUsers {
					_id
					username
				}
			}
			users {
				_id
				username
			}
			root {
				_id
			}
			parent {
				_id
				name
			}
			subtasks {
				_id
				name
			}
		}
	}
`;

function TaskDetails(props) {
	// Create a navigate function
	const navigate = useNavigate();

	let id = useParams().taskID;
	try {
		id = validation.checkUUID(id, "Task ID");
	} catch (error) {
		console.log(error);
	}

	// Get the current user's auth0 id
	const {
		currentUserID,
		isAuthenticated,
		isLoading: authIsLoading,
	} = useCurrentUserID();

	const [errMessage, setErrMessage] = useState(null);

	// Redux dispatch
	const dispatch = useDispatch();

	// Mutation to edit a task
	const [editTask] = useMutation(EDIT_TASK);
	// Mutation to assign a task to a user
	const [assignTask] = useMutation(ASSIGN_TASK);
	// Mutation to delete a task
	const [deleteTask] = useMutation(DELETE_TASK);

	const { data, loading, error, refetch } = useQuery(GET_TASK, {
		variables: { id },
	});

	// Redux selector
	const { newTask } = useSelector((state) => state.user);

	// Refresh on new task
	useEffect(() => {
		refetch();
	}, [newTask]);

	// If the user is not authenticated, display a message
	if (!isAuthenticated && !authIsLoading) return <NotAuthenticated />;

	if (loading) {
		return (
			<div className="task-details-div">
				<h1>Loading</h1>
			</div>
		);
	}

	if (error)
		return (
			<div className="task-details-div">
				<h1>{error.message}</h1>
			</div>
		);

	function TaskDetailsField(props) {
		return (
			<>
				<h2>{props.field_name}</h2>
				<h3 className="task-details-text">
					{props.children ? props.children : "N/A"}
				</h3>
			</>
		);
	}

	function NavButton(props) {
		let buttonFunc;
		switch (props.navType) {
			case "team":
				buttonFunc = () => navigate(`/teams/${props.navID}`);
				break;
			case "task":
				buttonFunc = () => navigate(`/tasks/task/${props.navID}`);
				break;
		}
		return <button onClick={buttonFunc}>{props.children}</button>;
	}

	const assignUser = async () => {
		let assignedUser = document.getElementById("assignUserToTask").value;
		console.log(assignedUser);
		if (assignedUser !== "") {
			assignTask({
				variables: {
					taskId: id,
					userId: assignedUser,
					assignedUserId: assignedUser,
				},
			}).then(() => {
				refetch();
			});
		}
	};
	const submitForm = async (e) => {
		// Prevent default behavior of form
		e.preventDefault();
		setErrMessage(null);

		// Get values from the form
		let taskName = e.target.elements.taskName.value;
		let taskDescription = e.target.elements.taskDescription.value;
		let taskPriority = parseInt(e.target.elements.taskPriority.value);
		let taskDeadline = e.target.elements.taskDeadline.value;

		if (!taskName || taskName.trim() === "") {
			taskName = data.getTask.name;
		}
		if (!taskDescription || taskDescription.trim() === "") {
			taskDescription = data.getTask.description;
		}

		if (!taskDeadline || taskDeadline.trim() === "") {
			taskDeadline = data.getTask.dueDate;
		}

		if (!taskPriority && taskPriority !== 0) {
			taskPriority = data.getTask.priority;
		}

		try {
			taskName = validation.checkTaskName(taskName);
			taskDescription = validation.checkTaskDescription(taskDescription);
			taskPriority = validation.checkTaskPriority(taskPriority);
			taskDeadline = validation.checkTaskDueDate(taskDeadline);
			editTask({
				variables: {
					taskId: id,
					userId: currentUserID,
					taskName,
					taskDescription,
					taskPriority,
					taskDueDate: taskDeadline,
				},
			});
			await refetch();
		} catch (e) {
			setErrMessage(`${e}`);
		}
	};

	const subtasks = data.getTask.subtasks ? (
		<>
			{data.getTask.subtasks.map((currSubTask) => {
				return (
					<h3
						className="task-details-text"
						key={"subtask_link_" + currSubTask._id}
					>
						<NavButton navType="task" navID={currSubTask._id}>
							{currSubTask.name}
						</NavButton>
					</h3>
				);
			})}
		</>
	) : (
		<></>
	);

	let isAssigned = false;
	data.getTask.users.forEach((user) => {
		if (user._id === currentUserID) {
			isAssigned = true;
		}
	});

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />
			<Box
				component="nav"
				sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
				aria-label="mailbox folders"
			>
				<Drawer
					variant="permanent"
					sx={{
						display: { xs: "none", sm: "block" },
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: drawerWidth,
						},
					}}
					open
				>
					<Box sx={{ pt: 12 }} />
					<SideBar rootID={data.getTask.root._id} taskID={id}></SideBar>
				</Drawer>
			</Box>
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: 3,
					width: { sm: `calc(100% - ${drawerWidth}px)` },
				}}
			>
				<div className="task-details-div">
					<h1 className="rocco-heading">Task Details</h1>
					<Alert severity="info">Task Information</Alert>
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
									primary="Task Name"
									secondary={data.getTask.name}
								/>
							</ListItem>
							<Divider component="li" />
							<ListItem>
								<ListItemText
									primary="Description"
									secondary={data.getTask.description}
								/>
							</ListItem>
							<Divider component="li" />
							<ListItem>
								<ListItemText
									primary="Priority"
									secondary={data.getTask.priority}
								/>
							</ListItem>
							<Divider component="li" />
							<ListItem>
								<ListItemText
									primary="Deadline"
									secondary={data.getTask.dueDate}
								/>
							</ListItem>
							<Divider component="li" />
							<ListItem>
								<ListItemText
									primary={"Users"}
									secondary={data.getTask.users.reduce((init, curr) => {
										return init + curr.username + "\n";
									}, "")}
								/>
							</ListItem>
							<Divider component="li" />
							<ListSubheader>Task's Team</ListSubheader>
							<ListItemButton
								component={"li"}
								role={"listitem"}
								onClick={() => navigate(`/teams/${data.getTask.team._id}`)}
							>
								{data.getTask.team.name}
							</ListItemButton>
							<Divider component="li" />
							<ListSubheader>Task's Parent</ListSubheader>
							{data.getTask.parent ? (
								<ListItemButton
								component={"li"}
								role={"listitem"}
									onClick={() =>
										navigate(`/tasks/task/${data.getTask.parent._id}`)
									}
								>
									{data.getTask.parent.name}
								</ListItemButton>
							) : (
								<ListItem>
									<ListItemText primary={"No Parent Task"} />
								</ListItem>
							)}
						</List>
					</Box>
					<Alert severity="info" sx={{ mt: 2 }}>
						Task Progress
					</Alert>
					<Divider />
					{data.getTask.subtasks && data.getTask.subtasks.length > 0 ? (
						<>
							{" "}
							<h2>Progress:</h2>
							<ProgressWheel
								value={data.getTask.progress * 100}
								refetch={refetch()}
							></ProgressWheel>
						</>
					) : isAssigned ? (
						<TaskDetailsField field_name="Completed:">
							<TaskCompleted
								taskId={id}
								userId={currentUserID}
								completed={data.getTask.completed}
								isAssigned={isAssigned}
								refetch={refetch()}
							></TaskCompleted>
						</TaskDetailsField>
					) : (
						<TaskDetailsField field_name="Completed:">
							<TaskCompleted
								taskId={id}
								userId={currentUserID}
								completed={data.getTask.completed}
								isAssigned={isAssigned}
								refetch={refetch()}
							></TaskCompleted>
							<Alert severity="warning" sx={{ mt: 2 }}>
								Must Be Assigned To This Task To Complete
							</Alert>
						</TaskDetailsField>
					)}
					{data.getTask.subtasks.length > 0 ? (
						<Stack>
							<Alert severity="info" sx={{ mt: 2 }}>
								Subtasks
							</Alert>
						</Stack>
					) : null}
					{subtasks}
					{data.getTask.team.admins.map((adminId) => {
						if (adminId._id === currentUserID) {
							let allUsers = data.getTask.team.admins.concat(
								data.getTask.team.nonAdminUsers
							);
							let toShow = [];
							allUsers.forEach((user) => {
								let flag = true;
								data.getTask.users.forEach((otherUser) => {
									if (user._id === otherUser._id) {
										flag = false;
									}
								});
								if (flag) {
									toShow.push(user);
								}
							});
							return (
								<div key={adminId._id}>
									<Alert severity="warning" sx={{ mt: 2 }}>
										Admin Options
									</Alert>
									<Stack>
										<Stack direction="row" justifyContent="center">
											<button
												className="rocco-button"
												onClick={() =>
													navigate(
														`/tasks/create/${data.getTask.team._id}?parentTaskId=${id}`
													)
												}
											>
												Create New Subtask
											</button>
											<button
												className="rocco-button"
												key={`delete${adminId._id}`}
												onClick={() => {
													deleteTask({
														variables: {
															taskId: id,
															userId: currentUserID,
															rootId: data.getTask.root._id,
														},
													}).then(() => {
														dispatch(deletedTask());
														navigate(`/teams/${data.getTask.team._id}`);
													});
												}}
											>
												Delete Task
											</button>
										</Stack>
										{toShow.length === 0 ? null : (
											<div>
												<button
													className="rocco-button"
													key={`assign${adminId._id}`}
													onClick={() => {
														assignUser();
													}}
												>
													Assign Task to User
												</button>
												<select
													name="assignUserToTask"
													id="assignUserToTask"
													className="filterItem"
													defaultValue=""
												>
													<option value="" disabled>
														Select your option
													</option>
													{toShow.map((user) => {
														return (
															<option key={`${user._id}`} value={user._id}>
																{user.username}
															</option>
														);
													})}
												</select>
											</div>
										)}
									</Stack>
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
												onKeyDown={(e) =>
													e.key === "Enter" && e.preventDefault()
												}
												id="taskName"
												name="taskName"
												label="Name"
											/>
											<TextField
												onKeyDown={(e) =>
													e.key === "Enter" && e.preventDefault()
												}
												id="taskDescription"
												name="taskDescription"
												label="Description"
											/>
											<TextField
												onKeyDown={(e) =>
													e.key === "Enter" && e.preventDefault()
												}
												id="taskPriority"
												name="taskPriority"
												label="Priority"
												type="number"
											/>
											<TextField
												onKeyDown={(e) =>
													e.key === "Enter" && e.preventDefault()
												}
												id="taskDeadline"
												name="taskDeadline"
												label="Deadline"
												InputLabelProps={{ shrink: true }}
												type="date"
											/>
										</div>
										<button type="submit" className="rocco-button">
											Edit Task
										</button>
										{errMessage ? (
											<Alert severity="error" sx={{ mt: 2 }}>
												{errMessage}
											</Alert>
										) : null}
									</Box>
								</div>
							);
						}
					})}
				</div>
			</Box>
		</Box>
	);
}
export default TaskDetails;
