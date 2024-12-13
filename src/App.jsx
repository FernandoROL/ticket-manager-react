import RoutesApp from "./routes";
import { BrowserRouter } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import AuthProvider from "./contexts/auth";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer/>
        <RoutesApp />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
