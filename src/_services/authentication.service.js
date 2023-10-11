export const authenticationService = {
	setAuthenticated(authenticated) {
		localStorage.setItem("authenticated", authenticated);
	},
	getAuthenticated() {
		return localStorage.getItem("authenticated");
	},
};
