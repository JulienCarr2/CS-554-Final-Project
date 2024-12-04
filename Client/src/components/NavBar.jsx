import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import { AppBar, Box, Stack, Toolbar } from "@mui/material";

const NavBar = () => {
	// Create a navigate function
	const navigate = useNavigate();

	// In order to access the user, you can use user here once you check if it's loaded and authenticated. (Authenticated meaning logged in.)
	const { user, isAuthenticated, isLoading } = useAuth0();

	return (
		<AppBar
			className="header-background mb-5"
			sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
		>
			<Toolbar>
				<button className="header-button" onClick={() => navigate("/")}>
					Home
				</button>
				<button className="header-button" onClick={() => navigate("/tasks")}>
					Tasks
				</button>
				<button className="header-button" onClick={() => navigate("/teams")}>
					Teams
				</button>
				{isLoading ? null : isAuthenticated ? (
					<button
						className="header-button"
						onClick={() => navigate(`/profile`)}
					>
						Profile
					</button>
				) : (
					<LoginButton />
				)}
				{isLoading ? null : isAuthenticated ? <LogoutButton /> : null}
			</Toolbar>
		</AppBar>
	);
};

export default NavBar;
