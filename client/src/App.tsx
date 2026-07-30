import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { History } from "./pages/History";
import { Session } from "./pages/Session";
import { SessionDetail } from "./pages/SessionDetail";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Define routes mapping paths to components */}
				<Route path="/" element={<Session />} />
				<Route path="/history" element={<History />} />
				<Route path="/history/:id" element={<SessionDetail />} />
				<Route path="/dashboard" element={<Dashboard />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
