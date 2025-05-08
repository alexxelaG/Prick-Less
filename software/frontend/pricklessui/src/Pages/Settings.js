import React, { useState, useEffect } from "react";
import "./Settings.css";

function Settings() {
    const [darkMode, setDarkMode] = useState(
        JSON.parse(localStorage.getItem("darkMode")) ?? false
    );

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
        localStorage.setItem("darkMode", JSON.stringify(darkMode));
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <div className="settings-container">
            <h1>Settings</h1>

            {/* User Profile Settings */}
            <div className="settings-section">
                <h2>User Profile</h2>
                <button onClick={() => alert("Edit Profile Clicked")}>Edit Profile</button>
                <button onClick={() => alert("Change Password Clicked")}>Change Password</button>
            </div>

            {/* Account & Security */}
            <div className="settings-section">
                <h2>Account & Security</h2>
                <button onClick={() => alert("Enable Two-Factor Authentication")}>Enable 2FA</button>
                <button onClick={() => alert("Delete Account Clicked")}>Delete Account</button>
            </div>

            {/* Notification Preferences */}
            <div className="settings-section">
                <h2>Notification Preferences</h2>
                <button onClick={() => alert("Manage Notifications Clicked")}>Manage Notifications</button>
                <button onClick={() => alert("Change Email Preferences Clicked")}>Email Preferences</button>
            </div>

            {/* Data & Privacy */}
            <div className="settings-section">
                <h2>Data & Privacy</h2>
                <button onClick={() => alert("Manage Data Clicked")}>Manage Data</button>
                <button onClick={() => alert("Download Data Clicked")}>Download Data</button>
            </div>

            {/* Connected Devices */}
            <div className="settings-section">
                <h2>Connected Devices</h2>
                <button onClick={() => alert("Pair a New Device Clicked")}>Pair a New Device</button>
                <button onClick={() => alert("Manage Devices Clicked")}>Manage Devices</button>
            </div>

            {/* Appearance & Accessibility */}
            <div className="settings-section">
                <h2>Appearance & Accessibility</h2>
                <button onClick={toggleDarkMode}>
                    {darkMode ? "Disable Dark Mode" : "Enable Dark Mode"}
                </button>
            </div>
        </div>
    );
}

export default Settings;