import { Route, Routes } from "react-router-dom";

// Importing the react components
import NavBar from "./components/NavBar";

// Importing the react pages
import CreateTask from "./pages/CreateTask";
import CreateTeam from "./pages/CreateTeam";
import Home from "./pages/Home";
import PageNotFound from "./pages/PageNotFound";
import Profile from "./pages/Profile";
import TaskDetails from "./pages/TaskDetails";
import Tasks from "./pages/Tasks";
import TeamDetails from "./pages/TeamDetails";
import Teams from "./pages/Teams";

// Importing the CSS file
import "./App.css";

function App() {
	return (
		<div className="App">
			<NavBar />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/tasks" element={<Tasks />} />
				<Route path="/tasks/task/:taskID" element={<TaskDetails />} />
				<Route path="/tasks/create/:teamId" element={<CreateTask />} />
				<Route path="/teams/create" element={<CreateTeam />} />
				<Route path="/teams" element={<Teams />} />
				<Route path="/teams/:teamId" element={<TeamDetails />} />
				<Route path="/profile" element={<Profile />} />
				<Route path="*" element={<PageNotFound />} />
			</Routes>
		</div>
	);
}

export default App;
