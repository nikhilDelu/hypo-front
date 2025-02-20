import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function App() {
    const [username, setUsername] = useState("");
    const [entryFee, setEntryFee] = useState(50);
    const [roomID, setRoomID] = useState("");
    const [inviteLink, setInviteLink] = useState("");
    const [players, setPlayers] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [winner, setWinner] = useState("");
    const [remainingTime, setRemainingTime] = useState(null);

    useEffect(() => {
      socket.on("roomCreated", ({ roomID, inviteLink }) => {
        setRoomID(roomID);
        setInviteLink(inviteLink);
        setPlayers([username]);  // Add the host to the players list
    });

        socket.on("userJoined", ({ players, totalPoints }) => {
            setPlayers(players);
            setTotalPoints(totalPoints);
        });

        socket.on("winnerAnnounced", ({ winnerUsername, totalPoints }) => {
            setWinner(winnerUsername);
            alert(`🏆 Winner: ${winnerUsername} (Prize: ${totalPoints} points)`);
        });

        socket.on("timerUpdate", ({ remainingTime }) => {
          setRemainingTime(remainingTime);
      });


        socket.on("quizEnded", ({ message }) => {
          alert(message);  // Show quiz end alert
          setRemainingTime(null); // Reset the timer display
      });

        return () => socket.off();
    }, [username]);

    const createRoom = () => {
        if (!username) return alert("Enter username first!");
        socket.emit("createRoom", { username, entryFee });
    };

    const joinRoom = () => {
        if (!username || !roomID) return alert("Enter username and Room ID!");
        socket.emit("joinRoom", { username, roomID });
    };

    const declareWinner = () => {
        if (!roomID) return alert("No room found!");
        const winnerUsername = prompt("Enter winner's username:");
        socket.emit("declareWinner", { roomID, winnerUsername });
    };

    const startQuiz = () => {
      if (!roomID) return alert("You must be in a room to start a quiz!");
      socket.emit("startQuiz", { roomID, duration: 30 });
  };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-4">🎮 Quiz Room App</h1>

            <input type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)}
                className="border p-2 rounded mb-2" />

            <button onClick={createRoom} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">Create Room</button>

            {inviteLink && (
                <div className="mb-4">
                    <p>Invite Link:</p>
                    <a href={inviteLink} className="text-blue-600">{inviteLink}</a>
                </div>
            )}

            <input type="text" placeholder="Enter Room ID" value={roomID} onChange={(e) => setRoomID(e.target.value)}
                className="border p-2 rounded mb-2" />

            <button onClick={joinRoom} className="bg-green-500 text-white px-4 py-2 rounded">Join Room</button>

            <h2 className="text-xl font-bold mt-6">Players:</h2>
            <ul className="list-disc">
                {players && players.map((player, index) => (
                    <li key={index}>{player}</li>
                ))}
            </ul>

            {totalPoints > 0 && <p className="mt-4">💰 Prize Pool: {totalPoints} points</p>}


            {/* Quiz Timer */}
            {remainingTime !== null && <h2>Time Left: {remainingTime}s</h2>}

            {/* Start Quiz Button (Only Host Should Start) */}
            <button onClick={startQuiz}>Start Quiz</button>

            {players && players.length > 0 && (
                <button onClick={declareWinner} className="bg-red-500 text-white px-4 py-2 rounded mt-4">Declare Winner</button>
            )}

            {winner && <p className="text-green-500 font-bold mt-4">🏆 Winner: {winner}</p>}
        </div>
    );
}
