import { useContext } from 'react'
import avatarImage from '../../assets/avatar.png'
import { AuthContext } from '../../contexts/auth'

import './style.css'

import { Link } from 'react-router-dom'

import { FiHome, FiUser, FiSettings } from 'react-icons/fi'

export default function Header() {
    const { user } = useContext(AuthContext)

    return (
        <div className="sidebar">
            <div>
                <img src={user.avatarUrl === null ? avatarImage : user.avatarUrl} alt="User profile picture" />
            </div>
            <Link to="/dashboard">
                <FiHome color="#FFF" size={24} />
                Tickets
            </Link>

            <Link to="/customers">
                <FiUser color="#FFF" size={24} />
                Customers
            </Link>

            <Link to="/profile">
                <FiSettings color="#FFF" size={24} />
                Profile
            </Link>
        </div>
    )
}