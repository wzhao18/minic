import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from './routes/HomePage'
import Login from './routes/LoginPage'
import Signup from "./routes/SignupPage";

function App() {
    
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/signup" element={<Signup/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;