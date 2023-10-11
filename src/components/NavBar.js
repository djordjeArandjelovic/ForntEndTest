import React, { useEffect, useState } from "react";
import { Box, Button, HStack, List, ListItem } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { authenticationService } from "../_services/authentication.service";

const NavBar = ({ currentPath }) => {
	const [refetch, setRefetch] = useState(false);

	const isUserAuthenticated = authenticationService.getAuthenticated();

	const handleLogin = () => {
		setRefetch(!refetch);
		authenticationService.setAuthenticated(true);
	};

	useEffect(() => {
		authenticationService.getAuthenticated();
	}, [refetch]);

	return (
		<>
			<section className="container container-center">
				<HStack
					justifyContent={"space-between"}
					px={10}
					py={5}
					boxShadow={"1px 6px 10px rgba(0, 0, 0, 0.5)"}
				>
					<Box className="links">
						<List display={"flex"} gap={5}>
							<ListItem
								color={currentPath === "/" ? "teal.400" : "gray.500"}
								fontSize={"xl"}
								transition={"0.5s"}
								_hover={{
									color: "teal.600",
									transform: "scale(1.05)",
								}}
							>
								<Link to={"/"}>Home</Link>
							</ListItem>
							{isUserAuthenticated && (
								<ListItem
									color={
										currentPath === "/favourites" ? "teal.400" : "gray.500"
									}
									fontSize={"xl"}
									transition={"0.5s"}
									_hover={{
										color: "teal.600",
										transform: "scale(1.05)",
									}}
								>
									<Link to={"/favourites"}>Favourites</Link>
								</ListItem>
							)}
						</List>
					</Box>
					<Box className="login">
						<Button
							transition={"0.5s"}
							children="Login"
							colorScheme={"teal"}
							width={"8rem"}
							rounded={"none"}
							onClick={handleLogin}
						/>
					</Box>
				</HStack>
			</section>
		</>
	);
};

export default NavBar;
