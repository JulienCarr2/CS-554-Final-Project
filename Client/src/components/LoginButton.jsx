import { useAuth0 } from "@auth0/auth0-react";

// Code Provided from the Auth0 documentation.
const LoginButton = () => {
	const { loginWithRedirect } = useAuth0();

	return (
		<button className="header-button" onClick={() => loginWithRedirect()}>
			Log In
		</button>
	);
};

export default LoginButton;
