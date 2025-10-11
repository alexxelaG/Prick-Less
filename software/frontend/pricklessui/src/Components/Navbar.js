import React from 'react';
import { Link } from 'react-router-dom'; 
import './Navbar.css';

function Navbar({ user, onLogout }) {
    return (
        <nav className="navbar"> 
            <h1>Prick-Less</h1> 
            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                {user && (
                    <>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/settings">Settings</Link></li>
                    </>
                )}
                <li><Link to="/about-us">About Us</Link></li>
                {user ? (
                    <li className="user-menu">
                        <span className="user-name">Hello, {user.name}</span>
                        <button className="logout-button" onClick={onLogout}>
                            Logout
                        </button>
                    </li>
                ) : (
                    <li>
                        <Link to="/login" className="login-link">Login</Link>
                    </li>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
