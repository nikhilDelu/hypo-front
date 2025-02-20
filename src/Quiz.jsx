import React, { useState, useEffect } from "react";

export default function Quiz({ socket, roomID, onFinish }) {
    const [question, setQuestion] = useState(null);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [remainingTime, setRemainingTime] = useState(10);
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const [quizEnded, setQuizEnded] = useState(false);
    const [scores, setScores] = useState({});

    useEffect(() => {
        socket.on("newQuestion", ({ question, questionNumber }) => {
            setQuestion(question);
            setQuestionNumber(questionNumber);
            setRemainingTime(10);
            setSelectedAnswer("");
        });

        socket.on("questionTimeout", () => {
            alert("Time's up!");
            setQuestion(null);
        });

        socket.on("quizEnded", ({ scores }) => {
            setScores(scores);
            setQuizEnded(true);
        });

        const timer = setInterval(() => {
            setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => {
            clearInterval(timer);
            socket.off("newQuestion");
            socket.off("questionTimeout");
            socket.off("quizEnded");
        };
    }, []);

    const submitAnswer = () => {
        if (!selectedAnswer) return alert("Select an answer!");
        socket.emit("submitAnswer", { roomID, answer: selectedAnswer });
        setQuestion(null);
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            {!quizEnded ? (
                question ? (
                    <div>
                        <h3>Question {questionNumber}: {question.question}</h3>
                        {question.options.map((opt, index) => (
                            <button key={index} onClick={() => setSelectedAnswer(opt)}>{opt}</button>
                        ))}
                        <br /><br />
                        <button onClick={submitAnswer}>Submit Answer</button>
                        <h3>Time Left: {remainingTime}s</h3>
                    </div>
                ) : (
                    <h3>Waiting for next question...</h3>
                )
            ) : (
                <div>
                    <h1>Quiz Over!</h1>
                    <h2>Scores:</h2>
                    {Object.entries(scores).map(([user, score], index) => (
                        <h3 key={index}>{user}: {score} points</h3>
                    ))}
                    <button onClick={onFinish}>Return to Room</button>
                </div>
            )}
        </div>
    );
}
