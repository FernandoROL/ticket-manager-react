import './signin.css';
import logo from '../../assets/logo.svg';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SignIn() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div>
            <div className="container-center">
                <div className="login">
                    <div className="login-area">
                        <img src={logo} alt="System logo" />
                    </div>

                    <form >
                        <h1>Login</h1>
                        <input
                            type="text"
                            placeholder='email@example.com'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder='******'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button type="submit">Login</button>
                    </form>

                    <div className="links-bottom">
                        <Link to="/">Forgot password?</Link>
                        <Link to="/register">Don't have an account? Sign-up</Link>
                    </div>

                </div>
            </div>
        </div>
    )
}