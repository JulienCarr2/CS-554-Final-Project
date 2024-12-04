import { gql, useMutation } from "@apollo/client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { newTask } from "../actions";
import CustomCard from "../components/CustomCard";
import NotAuthenticated from "../components/NotAuthenticated";
import { useCurrentUserID } from "../utils/auth";
import validation from "../utils/validation/rootValidation";

const CREATE_TASK = gql`
	mutation Mutation(
		$userId: ID!
		$teamId: ID!
		$taskName: String!
		$parentTaskId: ID
		$taskDescription: String
		$taskDueDate: String!
		$taskPriority: Int!
	) {
		createTask(
			userID: $userId
			teamID: $teamId
			taskName: $taskName
			parentTaskID: $parentTaskId
			taskDescription: $taskDescription
			taskDueDate: $taskDueDate
			taskPriority: $taskPriority
		) {
			_id
		}
	}
`;

const CreateTask = () => {
	// Get the current user's auth0 id
	const {
		currentUserID,
		isAuthenticated,
		isLoading: authIsLoading,
	} = useCurrentUserID();

	// Get the team id from the url
	const { teamId } = useParams();
	const [errMessage, setErrMessage] = useState(null);
	const [submit, setSubmit] = useState(false);

	// Get the parent task id from a query param if it exists
	const [searchParams] = useSearchParams();
	const parentTaskId = searchParams.get("parentTaskId");

	// Create a navigate function
	const navigate = useNavigate();

	// Redux dispatch
	const dispatch = useDispatch();

	// Mutation to create a task
	const [createTask, { loading: createIsLoading, error: createError }] =
		useMutation(CREATE_TASK);

	// If the user is not authenticated, display a message
	if (!isAuthenticated && !authIsLoading) return <NotAuthenticated />;

	// Event handler for creating a task
	const handleSubmit = async (e) => {
		// Prevent default behavior of form
		e.preventDefault();

		// Get values from the form
		let { taskName, taskDescription, taskDueDate, taskPriority } =
			e.target.elements;
		try {
			// Validate the inputs
			setErrMessage(null);
			setSubmit(false);
			taskName = validation.checkTaskName(taskName.value);
			taskDescription = taskDescription.value
				? validation.checkTaskDescription(taskDescription.value)
				: taskDescription.value;
			taskDueDate = validation.checkTaskDueDate(taskDueDate.value);
			taskPriority = validation.checkTaskPriority(parseInt(taskPriority.value));
			createTask({
				variables: {
					userId: currentUserID,
					teamId,
					taskName,
					parentTaskId,
					taskDescription,
					taskDueDate,
					taskPriority,
				},
			}).then(() => {
				dispatch(newTask());
				setSubmit(true);
			});
		} catch (e) {
			setErrMessage(`${e}`);
		}
	};

	// Loading
	if (createIsLoading || authIsLoading) {
		return (
			<h1 className="rocco-heading text-red-500" style={{ marginTop: 120 }}>
				Loading...
			</h1>
		);
	}

	return (
		<div style={{ marginTop: 120 }}>
			<CustomCard>
				<h1 className="rocco-heading">Create New Task</h1>
				<form onSubmit={handleSubmit}>
					<div className="mb-3">
						<label className="rocco-label">
							Name:{" "}
							<input
								type="text"
								name="taskName"
								className="rocco-input"
								placeholder="Required"
							/>{" "}
							<span className="text-red-500">*</span>
						</label>
					</div>
					<div className="mb-3">
						<label className="rocco-label">
							Description:{" "}
							<input
								type="text"
								name="taskDescription"
								className="rocco-input"
								placeholder="Optional"
							/>
						</label>
					</div>
					<div className="mb-3">
						<label className="rocco-label">
							Due Date:{" "}
							<input
								type="date"
								name="taskDueDate"
								className="rocco-input"
								placeholder="Required"
							/>{" "}
							<span className="text-red-500">*</span>
						</label>
					</div>
					<div className="mb-3">
						<label className="rocco-label">
							Priority:{" "}
							<input
								type="number"
								name="taskPriority"
								className="rocco-input"
								placeholder="Required"
							/>{" "}
							<span className="text-red-500">*</span>
						</label>
					</div>
					<button type="submit" className="rocco-button">
						Create Task
					</button>
				</form>
				{errMessage ? (
					<h1 className="rocco-heading text-red-500" style={{ marginTop: 120 }}>
						{errMessage}
					</h1>
				) : createError ? (
					<h1 className="rocco-heading text-red-500" style={{ marginTop: 120 }}>
						{createError.message}
					</h1>
				) : submit ? (
					parentTaskId && parentTaskId.length > 0 ? (
						navigate(`/tasks/task/${parentTaskId}`)
					) : (
						navigate(`/teams/${teamId}`)
					)
				) : null}
			</CustomCard>
		</div>
	);
};

export default CreateTask;
