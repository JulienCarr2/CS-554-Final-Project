import * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useCurrentUserID } from "../utils/auth";
import NotAuthenticated from "../components/NotAuthenticated";

const TOGGLE_COMPLETED = gql`
	mutation Mutation($taskId: ID!, $userId: ID!, $completed: Boolean!) {
		modifyTask(taskID: $taskId, userID: $userId, completed: $completed) {
			completed
		}
	}
`;

export default function TaskCompleted(props) {
	const [toggleCompleted] = useMutation(TOGGLE_COMPLETED);

	const {
		currentUserID,
		isAuthenticated,
		isLoading: authIsLoading,
	} = useCurrentUserID();

	// If the user is not authenticated, display a message
	if (!isAuthenticated && !authIsLoading) return <NotAuthenticated />;

	async function toggleCheck(event) {
		console.log(event.target.checked);

		const { data, loading, error } = await toggleCompleted({
			variables: {
				taskId: props.taskId,
				userId: props.userId,
				completed: event.target.checked,
			},
		});
		await props.refetch;
		console.log("completed value: ", data.modifyTask.completed);
	}

	return (
		<Checkbox
			defaultChecked={props.completed}
			sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
			onChange={toggleCheck}
			disabled={!props.isAssigned}
		/>
	);
}
