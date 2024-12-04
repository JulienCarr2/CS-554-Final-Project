import { useAuth0 } from "@auth0/auth0-react";
import CustomCard from "./CustomCard";

const NotAuthenticated = () => {
	const { loginWithRedirect } = useAuth0();
	return (
		<div className="flex justify-center items-center min-h-screen">
			<CustomCard>
				<h1 className="rocco-heading text-red-600">
					You are not Authenticated
				</h1>
				<p className="text-lg mb-5">Please log in to create a team</p>
				<button className="rocco-button" onClick={() => loginWithRedirect()}>
					Login
				</button>
			</CustomCard>
		</div>
	);
};

export default NotAuthenticated;
