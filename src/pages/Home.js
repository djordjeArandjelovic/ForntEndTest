import {
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	useDisclosure,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	ModalFooter,
	Button,
	useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { authenticationService } from "../_services/authentication.service";

const Home = () => {
	// USER
	const isUserAuthenticated = authenticationService.getAuthenticated();

	// TABLE DATA
	const [tableValues, setTableValues] = useState([]);

	// MODAL DATA
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [modalData, setModalData] = useState({
		symbol: "",
		last_price: "",
		high: "",
		low: "",
	});

	// FAVOURITES
	const [favourites, setFavourites] = useState(() => {
		const savedFavourites = localStorage.getItem("favourites");
		return savedFavourites ? JSON.parse(savedFavourites) : [];
	});
	// TOAST FOR ADD/REMOVE
	const toast = useToast();

	// HELPER ARRAY
	let symbolValues = [];

	useEffect(() => {
		axios
			.get("/v1/symbols")
			.then((response) => {
				//Create socket connections
				for (let i = 0; i < 5; i++) {
					// BEGIN: WebSocket Connection
					let symbol = response.data[i];

					symbol = symbol.toString().toUpperCase();
					const socket = new WebSocket("wss://api-pub.bitfinex.com/ws/2");
					let msg = JSON.stringify({
						event: "subscribe",
						channel: "ticker",
						symbol: "t" + symbol,
					});

					socket.onopen = () => {
						socket.send(msg);
						console.log("WebSocket connection established");
					};

					socket.onmessage = (event) => {
						//TODO: Check the event time stamp why is the value not in good format ? https://docs.bitfinex.com/docs/ws-general
						// let timeStamp=event.timeStamp;
						//let updateTime = new Date(timeStamp).toLocaleTimeString();

						let updateTime = new Date(Date.now()).toLocaleTimeString();

						// console.log(`Received message: ${event.data}`);
						// data is in format [CHANNEL_ID, [array of values]]

						const messageResponseData = JSON.parse(event.data);

						if (Array.isArray(messageResponseData)) {
							if (messageResponseData[1] === "hb") {
							} else {
								let symbolItemIndex = symbolValues.findIndex(
									(item) => item.symbol === symbol
								);

								if (symbolItemIndex != -1) {
									symbolValues[symbolItemIndex].last_price =
										messageResponseData[1][6];
									symbolValues[symbolItemIndex].change =
										messageResponseData[1][4];
									symbolValues[symbolItemIndex].change_percent =
										messageResponseData[1][5] * 100;
									symbolValues[symbolItemIndex].high =
										messageResponseData[1][8];
									symbolValues[symbolItemIndex].low = messageResponseData[1][9];
									symbolValues[symbolItemIndex].time = updateTime;

									setTableValues([...symbolValues]);
								} else {
									let symbolItem = {
										symbol: symbol,
										last_price: messageResponseData[1][6],
										change: messageResponseData[1][4],
										change_percent: messageResponseData[1][5] * 100,
										high: messageResponseData[1][8],
										low: messageResponseData[1][9],
										time: updateTime,
									};

									symbolValues.push(symbolItem);

									setTableValues([...symbolValues]);
								}
							}
						}
					};
				}
			})
			.catch((error) => {
				console.error(error);
			});
		return () => {};
	}, []);

	const handleClick = async (symbol) => {
		try {
			const res = await axios.get(`/v1/pubticker/${symbol}`);
			setModalData({
				...res.data,
				symbol: symbol,
			});
			onOpen();
		} catch (error) {
			console.log("Error from handleClick fetch:", error);
		}
	};

	const handleFav = (symbol) => {
		if (!favourites?.includes(symbol)) {
			const updatedFavourites = [...favourites, symbol];
			setFavourites(updatedFavourites);
			localStorage.setItem("favourites", JSON.stringify(updatedFavourites));
			toast({
				title: "Success.",
				description: "Added to favourites.",
				status: "success",
				position: "top",
				duration: 2500,
				isClosable: true,
			});
		}
	};

	const handleDelete = (symbol) => {
		const updatedFavourites = favourites.filter((fav) => fav !== symbol);
		setFavourites(updatedFavourites);
		localStorage.setItem("favourites", JSON.stringify(updatedFavourites));
		toast({
			title: "Success.",
			description: "Removed to favourites.",
			status: "error",
			position: "top",
			duration: 2500,
			isClosable: true,
		});
	};

	return (
		<>
			<section className="container container-center">
				<TableContainer
					mt={5}
					p={3}
					boxShadow={"4px 1px 10px rgba(0, 0, 0, 0.5)"}
				>
					<Table colorScheme={"teal"}>
						<Thead>
							<Tr>
								<Th width={"xs"}>Name</Th>
								<Th textAlign={"right"}>Last</Th>
								<Th textAlign={"right"}>Change</Th>
								<Th textAlign={"right"}>Change Percent</Th>
								<Th textAlign={"right"}>High</Th>
								<Th textAlign={"right"}>Low</Th>
								<Th textAlign={"right"}>Last Updated</Th>
							</Tr>
						</Thead>
						<Tbody>
							{tableValues?.map((item, index) => (
								<Tr
									key={index}
									bg={"#fff"}
									transition="0.5s"
									_hover={{
										bg: "rgb(243, 242, 242);",
										transform: "scale(1.02)",
									}}
								>
									<Td
										onClick={() => handleClick(item.symbol)}
										cursor={"pointer"}
										color={"teal.400"}
										fontWeight={"600"}
									>
										{item.symbol}
									</Td>
									<Td textAlign={"right"}>{item.last_price.toFixed(3)}</Td>
									<Td textAlign={"right"}>{item.change.toFixed(3)}</Td>
									<Td textAlign={"right"}>{item.change_percent.toFixed(3)}</Td>
									<Td textAlign={"right"}>{item.high.toFixed(3)}</Td>
									<Td textAlign={"right"}>{item.low.toFixed(3)}</Td>
									<Td textAlign={"right"}>{item.time}</Td>
								</Tr>
							))}
						</Tbody>
					</Table>
				</TableContainer>
			</section>
			<Modal size={"4xl"} isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader color={"teal.400"}>{modalData.symbol}</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<TableContainer>
							<Table colorScheme={"teal"}>
								<Thead>
									<Tr>
										<Th>Symbol</Th>
										<Th textAlign={"right"}>Last Price</Th>
										<Th textAlign={"right"}>High</Th>
										<Th textAlign={"right"}>Low</Th>
									</Tr>
								</Thead>
								<Tbody>
									<Tr>
										<Td>{modalData?.symbol}</Td>
										<Td textAlign={"right"}>{modalData?.last_price}</Td>
										<Td textAlign={"right"}>{modalData?.high}</Td>
										<Td textAlign={"right"}>{modalData?.low}</Td>
									</Tr>
								</Tbody>
							</Table>
						</TableContainer>
					</ModalBody>
					{isUserAuthenticated && (
						<ModalFooter placeContent={"start"}>
							<Button
								colorScheme={
									favourites?.includes(modalData.symbol) ? "red" : "teal"
								}
								children={
									favourites?.includes(modalData.symbol)
										? "Remove from Favourites"
										: "Add to Favourites"
								}
								rounded={"none"}
								onClick={
									favourites?.includes(modalData.symbol)
										? () => handleDelete(modalData.symbol)
										: () => handleFav(modalData.symbol)
								}
							/>
						</ModalFooter>
					)}
				</ModalContent>
			</Modal>
		</>
	);
};

export default Home;
