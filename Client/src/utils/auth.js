import { gql, useQuery } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

// Query to get a user by their auth0 id
const GET_USER_BY_AUTH_ID = gql`
	query Query($authId: ID!) {
		getUserByAuthID(authID: $authId) {
			_id
		}
	}
`;

export const useCurrentUserID = () => {
	const { user, isAuthenticated, isLoading } = useAuth0();
	const [currentUserID, setCurrentUserID] = useState(null);

	const { data } = useQuery(GET_USER_BY_AUTH_ID, {
		variables: { authId: user?.sub },
		skip: !isAuthenticated || !user?.sub,
	});

	// Effect to handle the change of data
	useEffect(() => {
		if (data?.getUserByAuthID?._id) {
			setCurrentUserID(data.getUserByAuthID._id);
		}
	}, [data]);

	return { currentUserID, isLoading, isAuthenticated };
};
