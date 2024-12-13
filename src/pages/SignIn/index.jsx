import './signin.css';
import logo from '../../assets/logo.svg';
import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import { AuthContext } from '../../contexts/auth';

export default function SignIn() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { signIn, loadingAuth } = useContext(AuthContext);

    function handleSubmit(event) {
        event.preventDefault();

        if(email !== '' && password !== ''){
            signIn(email, password);
        } else {
            alert("Please fill in all fields!");
        }
    }

    return (
        <div>
            <div className="container-center">
                <div className="login">
                    <div className="login-area">
                        <img src={logo} alt="System logo" />
                    </div>

                    <form onSubmit={handleSubmit}>
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

                        <button type="submit">
                            {loadingAuth ? "Loading..." : `Login`}
                        </button>
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