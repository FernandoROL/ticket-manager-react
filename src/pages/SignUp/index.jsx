import './signup.css';
import logo from '../../assets/logo.svg';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SignUp() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    return (
        <div>
            <div className="container-center">
                <div className="login">
                    <div className="login-area">
                        <img src={logo} alt="System logo" />
                    </div>

                    <form >
                        <h1>Register</h1>

                        <input
                            type="text"
                            placeholder='Username...'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder='email@example.com'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder='*********'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button type="submit">Register</button>
                    </form>

                    <Link to="/">Already have and account? Sign-in</Link>

                </div>
            </div>
        </div>
    )
}