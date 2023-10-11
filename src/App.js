import { Route, Routes, useLocation } from "react-router";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Favourites from "./pages/Favourites";

function App() {
	const location = useLocation();
	return (
		<>
			<NavBar currentPath={location.pathname} />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/favourites" element={<Favourites />} />
			</Routes>
		</>
	);
}

export default App;
