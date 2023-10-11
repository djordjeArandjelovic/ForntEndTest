import React, { useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router";

const Favourites = () => {
	// REFETCH FOR REMOVE
	const navigate = useNavigate();

	// TABLE DATA
	const [favTableValues, setFavTableValues] = useState([]);

	const [favourites, setFavourites] = useState(() => {
		const savedFavourites = localStorage.getItem("favourites");
		return savedFavourites ? JSON.parse(savedFavourites) : [];
	});

	// MODAL DATA
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [modalData, setModalData] = useState({
		symbol: "",
		last_price: "",
		high: "",
		low: "",
	});

	// HELPER ARRAY
	let favSymbolValues = [];

	useEffect(() => {
		axios
			.get("/v1/symbols")
			.then(() => {
				favourites.forEach((favourite) => {
					let symbol = favourite;
					const socket = new WebSocket("wss://api-pub.bitfinex.com/ws/2");
					let msg = JSON.stringify({
						event: "subscribe",
						channel: "ticker",
						symbol: "t" + favourite,
					});

					socket.onopen = () => {
						socket.send(msg);
						console.log("WebSocket connection from Fav established");
					};

					socket.onmessage = (event) => {
						let updateTime = new Date(Date.now()).toLocaleTimeString();
						const messageResponseData = JSON.parse(event.data);
						if (Array.isArray(messageResponseData)) {
							if (messageResponseData[1] === "hb") {
							} else {
								let symbolItemIndex = favSymbolValues.findIndex(
									(item) => item.symbol === symbol
								);
								if (symbolItemIndex !== -1) {
									favSymbolValues[symbolItemIndex].last_price =
										messageResponseData[1][6];
									favSymbolValues[symbolItemIndex].change =
										messageResponseData[1][4];
									favSymbolValues[symbolItemIndex].change_percent =
										messageResponseData[1][5] * 100;
									favSymbolValues[symbolItemIndex].high =
										messageResponseData[1][8];
									favSymbolValues[symbolItemIndex].low =
										messageResponseData[1][9];
									favSymbolValues[symbolItemIndex].time = updateTime;

									setFavTableValues([...favSymbolValues]);
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
									favSymbolValues.push(symbolItem);

									setFavTableValues([...favSymbolValues]);
								}
							}
						}
					};
				});
			})
			.catch((error) => {
				console.log(error);
			});
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
		}
	};

	const handleDelete = (symbol) => {
		const updatedFavourites = favourites.filter((fav) => fav !== symbol);
		setFavourites(updatedFavourites);
		localStorage.setItem("favourites", JSON.stringify(updatedFavourites));
		navigate(0);
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
							{favTableValues?.map((fav, index) => {
								return (
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
											cursor={"pointer"}
											color={"teal.400"}
											fontWeight={"600"}
											onClick={() => handleClick(fav?.symbol)}
										>
											{fav.symbol}
										</Td>
										<Td textAlign={"right"}>{fav.last_price.toFixed(3)}</Td>
										<Td textAlign={"right"}>{fav.change.toFixed(3)}</Td>
										<Td textAlign={"right"}>{fav.change_percent.toFixed(3)}</Td>
										<Td textAlign={"right"}>{fav.high.toFixed(3)}</Td>
										<Td textAlign={"right"}>{fav.low.toFixed(3)}</Td>
										<Td textAlign={"right"}>{fav.time}</Td>
									</Tr>
								);
							})}
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
				</ModalContent>
			</Modal>
		</>
	);
};

export default Favourites;
