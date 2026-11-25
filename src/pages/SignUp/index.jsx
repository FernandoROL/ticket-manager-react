import './signup.css';
import logo from '../../assets/logo.svg';
import { useState, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { AuthContext } from '../../contexts/auth';

export default function SignUp() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const { signUp, loadingAuth, signed, loading } = useContext(AuthContext);

    async function handleSubmit(event) {
        event.preventDefault();

        if(username !== '' && email !== '' && password !== ''){
            await signUp(email, password, username);
        } else {
            alert("Please fill in all fields!");
        }
    }

    if (!loading && signed && !loadingAuth) return <Navigate to="/dashboard" replace />;

    return (
        <div>
            <div className="container-center">
                <div className="login">
                    <div className="login-area">
                        <img src={logo} alt="System logo" />
                    </div>

                    <form onSubmit={handleSubmit}>
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

                        <button type="submit" disabled={loadingAuth || loading}>
                            {loadingAuth ? 'Loading...' : 'Register'}
                        </button>
                    </form>

                    <Link to="/">Already have and account? Sign-in</Link>

                </div>
            </div>
        </div>
    )
}