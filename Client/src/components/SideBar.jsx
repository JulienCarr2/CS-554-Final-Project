import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { TreeView } from "@mui/x-tree-view/TreeView";
import React, { useEffect, useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { alpha, styled } from "@mui/material/styles";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
import { useSpring, animated } from "@react-spring/web";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import { useSelector } from "react-redux";

function SideBar(props) {
	const navigate = useNavigate();

	let rootID = props.rootID; // to query the project
	let taskID = props.taskID; // to auto-expand the tree to the current task

	const getFullProject = gql`
		query Query($rootID: ID!) {
			getFullProject(rootID: $rootID) {
				_id
				name
				subtasks {
					_id
				}
			}
		}
	`;

	const { data, loading, error, refetch } = useQuery(getFullProject, {
		variables: { rootID: rootID },
	});

	// Redux selector
	const { newTask, deletedTask } = useSelector((state) => state.user);

	// Refresh on new task
	useEffect(() => {
		refetch();
	}, [newTask, deletedTask]);

	if (loading) {
		return <h1>Loading</h1>;
	}
	if (error) return <h1>{error.message}</h1>;

	const root = data.getFullProject.find((obj) => {
		return obj._id === rootID;
	});

	function TransitionComponent(props) {
		const style = useSpring({
			to: {
				opacity: props.in ? 1 : 0,
				transform: `translate3d(${props.in ? 0 : 20}px,0,0)`,
			},
		});

		return (
			<animated.div style={style}>
				<Collapse {...props} />
			</animated.div>
		);
	}

	const CustomTreeItem = React.forwardRef((props, ref) => (
		<TreeItem {...props} TransitionComponent={TransitionComponent} ref={ref} />
	));

	const StyledTreeItem = styled(CustomTreeItem)(({ theme }) => ({
		[`& .${treeItemClasses.iconContainer}`]: {
			"& .close": {
				opacity: 0.3,
			},
		},
		[`& .${treeItemClasses.group}`]: {
			marginLeft: 15,
			paddingLeft: 18,
			borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
		},
	}));

	function getTreeItems(currTask) {
		return (
			<StyledTreeItem
				key={currTask._id}
				nodeId={currTask._id}
				label={currTask.name}
				onDoubleClick={(e) => {
					e.stopPropagation();
					return navigate(`/tasks/task/${currTask._id}`);
				}}
			>
				{Array.isArray(currTask.subtasks)
					? currTask.subtasks.map((currSubTask) =>
							getTreeItems(
								data.getFullProject.find((obj) => {
									return obj._id === currSubTask._id;
								})
							)
					  )
					: null}
			</StyledTreeItem>
		);
	}

	return (
		<Box sx={{ minHeight: 110, flexGrow: 1, maxWidth: 300 }}>
			<TreeView
				aria-label="rich object"
				defaultCollapseIcon={<ExpandMoreIcon />}
				defaultExpanded={["root"]}
				defaultExpandIcon={<ChevronRightIcon />}
			>
				{getTreeItems(root)}
			</TreeView>
		</Box>
	);
}

export default SideBar;
