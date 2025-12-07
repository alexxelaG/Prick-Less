import React from 'react';
import { Link } from 'react-router-dom'; 
import './Navbar.css';

function Navbar() {
    return (
        <nav className="navbar"> 
            <h1>Prick-Less</h1> 
            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/about-us">About Us</Link></li>
            </ul>
        </nav>
    );
}

export default Navbar;
