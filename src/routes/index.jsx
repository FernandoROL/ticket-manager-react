import { Route, Routes } from "react-router-dom"

import SignIn from "../pages/SignIn"
import SignUp from "../pages/SignUp"
import Dashboard from "../pages/Dashboard"
import Private from "./private"
import Profile from "../pages/Profile"
import Customers from "../pages/Customers"
import NewTicket from "../pages/NewTicket"

export default function RoutesApp() {
    return (
        <>
            <Routes path="/">
                <Route path="*" element={<SignIn />} />
                <Route path="register" element={<SignUp />} />

                <Route path="dashboard" element={<Private><Dashboard /></Private>} />
                <Route path="profile" element={<Private><Profile/></Private>}/>
                <Route path="customers" element={<Private><Customers/></Private>} />
                <Route path="new" element={<Private><NewTicket/></Private>} />
                <Route path="edit/:id" element={<Private><NewTicket/></Private>} />
            </Routes>
        </>
    )
}