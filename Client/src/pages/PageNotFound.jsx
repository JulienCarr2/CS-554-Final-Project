import React from "react";
import { useNavigate } from "react-router-dom";
import CustomCard from "../components/CustomCard";

const PageNotFound = (props) => {
	const navigate = useNavigate();
	return (
		<div className="flex justify-center items-center min-h-screen">
			<CustomCard>
				<h1 className="rocco-heading text-red-600">Page Not Found</h1>
				<button className="rocco-button" onClick={() => navigate("/")}>
					Home
				</button>
			</CustomCard>
		</div>
	);
};

export default PageNotFound;
