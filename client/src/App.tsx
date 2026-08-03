import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components";
import {
	Dashboard,
	History,
	Login,
	Session,
	SessionDetail,
	Signup,
} from "./pages";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Define routes mapping paths to components */}
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />
				<Route element={<ProtectedRoute />}>
					<Route path="/" element={<Session />} />
					<Route path="/history" element={<History />} />
					<Route path="/history/:id" element={<SessionDetail />} />
					<Route path="/dashboard" element={<Dashboard />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
