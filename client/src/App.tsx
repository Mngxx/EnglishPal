import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { History } from "./pages/History";
import { Login } from "./pages/Login";
import { Session } from "./pages/Session";
import { SessionDetail } from "./pages/SessionDetail";
import { Signup } from "./pages/Signup";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Define routes mapping paths to components */}
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/" element={<Session />} />
				<Route path="/history" element={<History />} />
				<Route path="/history/:id" element={<SessionDetail />} />
				<Route path="/dashboard" element={<Dashboard />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
