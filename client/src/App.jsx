import React, { useEffect, useState } from "react";
import loginService from "./services/login";
import recordService from "./services/records";
import "./App.css";

function LogoutButton({ handleLogout }) {
    return (
        <button type="button" onClick={handleLogout}>
            logout
        </button>
    );
}

function App() {
    const [user, setUser] = useState("");
    const [username, setUsername] = useState("");
    const [records, setRecords] = useState("");
    const [password, setPassword] = useState("");

    async function getRecords(id) {
        const userRecords = await recordService.getAllUserRecords(id);
        setRecords(userRecords);
    }

    function handleLogout() {
        window.localStorage.removeItem("recUserCreds");
        setUser(null);
        setRecords(null);
    }

    // on page load check if user has logged in before
    useEffect(() => {
        const loggedUserJSON = window.localStorage.getItem("recUserCreds");
        if (loggedUserJSON) {
            const currentUser = JSON.parse(loggedUserJSON);
            getRecords(currentUser.id);
            setUser(currentUser);
            recordService.setToken(currentUser.token);
        }
    }, []);

    function Records() {
        return records.map((record) => (
            <div key={record.id}>{record.record}</div>
        ));
    }

    async function handleLogin(event) {
        event.preventDefault();
        try {
            const loggedUser = await loginService.login({ username, password });
            window.localStorage.setItem(
                "recUserCreds",
                JSON.stringify(loggedUser)
            );
            console.log(loggedUser);
            // recordService.setToken(user.token);
            getRecords(loggedUser.id);
            setUser(loggedUser);
            setUsername("");
            setPassword("");
        } catch (err) {
            console.error(err.response.data.error);
        }
    }

    return (
        <>
            {!user ? (
                <form onSubmit={handleLogin}>
                    <div>
                        username
                        <input
                            type="text"
                            value={username}
                            name="Username"
                            onChange={({ target }) => setUsername(target.value)}
                        />
                    </div>
                    <div>
                        password
                        <input
                            type="password"
                            value={password}
                            name="Password"
                            onChange={({ target }) => setPassword(target.value)}
                        />
                    </div>
                    <button type="submit">login</button>
                </form>
            ) : null}
            {records ? <Records /> : null}
            {user ? <LogoutButton handleLogout={handleLogout} /> : null}
        </>
    );
}

export default App;
