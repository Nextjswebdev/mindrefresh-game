'use client'

import React, { useState, useEffect } from 'react';
import questionsData from '../questions.json';
import 'animate.css'; // Import animate.css for animations

interface Question {
  type: string;
  content: string;
  options?: string[];
  answer: string;
  hint: string;
}

interface LeaderboardEntry {
  name: string;
  score: number;
}

const Game = () => {
  const [userName, setUserName] = useState<string>('');
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost'>('start');
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [highestScore, setHighestScore] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [timer, setTimer] = useState<number>(30);
  const [canChangeQuestion, setCanChangeQuestion] = useState<boolean>(true);
  const [canShowHint, setCanShowHint] = useState<boolean>(true);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showValidationMessage, setShowValidationMessage] = useState<boolean>(false);
  const [hintPenalty, setHintPenalty] = useState<number>(2);
  const [changeQuestionPenalty, setChangeQuestionPenalty] = useState<number>(4);

  const isLocalStorageAvailable = (): boolean => {
    try {
      const test = 'localStorageTest';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    if (questionsData) {
      if (isLocalStorageAvailable()) {
        try {
          const storedScores = JSON.parse(localStorage.getItem('leaderboard') || '[]') as LeaderboardEntry[];
          const maxScore = storedScores.length > 0 ? Math.max(...storedScores.map((item) => item.score)) : 0;
          setHighestScore(maxScore);
          setLeaderboard(storedScores);
        } catch (error) {
          console.error('Error accessing localStorage:', error);
          setHighestScore(0);
          setLeaderboard([]);
        }
      } else {
        console.warn('localStorage is not available');
        setHighestScore(0);
        setLeaderboard([]);
      }
    }
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (timer === 0) {
      setGameState('lost');
      handleGameOver(score); // Pass the current score to handleGameOver
    }
  }, [gameState, timer, score]);

  const handleAnswer = (selected: string) => {
    if (gameState !== 'playing' || currentQuestionIndex === null) return;

    const currentQuestion = currentQuestions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer.toLowerCase().trim();
    const userAnswerTrimmed = selected.toLowerCase().trim();
    const correct = userAnswerTrimmed === correctAnswer;

    setSelectedOption(selected);

    const timeTaken = 30 - timer;
    let timeScore = Math.max(0, 20 - 2 * timeTaken);

    if (timeTaken > 20) {
      timeScore = 0;
    }

    setTimeout(() => {
      if (correct) {
        const newScore = score + timeScore + 1;
        setScore(newScore);

        if (currentQuestionIndex === currentQuestions.length - 1) {
          setGameState('won');
          handleGameOver(newScore); // Pass the final score
        } else {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedOption(null);
          setUserAnswer('');
        }
      } else {
        setGameState('lost');
        handleGameOver(score); // Pass the current score
      }
      setTimer(30);
    }, 1000);
  };

  const handleStart = () => {
    if (!userName) {
      setShowValidationMessage(true);
      return;
    }

    try {
      const shuffledQuestions = Object.values(questionsData).flat().sort(() => Math.random() - 0.5);
      setCurrentQuestions(shuffledQuestions);
      setShowValidationMessage(false);
      setGameState('playing');
      setCurrentQuestionIndex(0);
      setScore(0); // Ensure score is reset when starting a new game
      setSelectedOption(null);
      setUserAnswer('');
      setTimer(30);
      setCanChangeQuestion(true);
      setCanShowHint(true);
    } catch (error) {
      console.error('Error starting the game:', error);
    }

    // Pass initial score of 0 to handleGameOver
    handleGameOver(0);
  };

  const handlePlayAgain = () => {
    setGameState('start');
    setUserName('');
    setScore(0);
    setCurrentQuestionIndex(null);
    setSelectedOption(null);
    setUserAnswer('');
    setTimer(30);
    setCanChangeQuestion(true);
    setCanShowHint(true);
    setShowHint(false);
  };

  const handleChangeQuestion = () => {
    if (canChangeQuestion && currentQuestionIndex !== null) {
      const nextIndex = (currentQuestionIndex + 1) % currentQuestions.length;
      setCurrentQuestionIndex(nextIndex);
      setSelectedOption(null);
      setUserAnswer('');
      setTimer(30);
      setCanChangeQuestion(false);

      // Deduct points for changing question
      const newScore = Math.max(0, score - 4); // Deduct 4 points
      setScore(newScore);
    }
  };

  const handleHint = () => {
    if (canShowHint && currentQuestionIndex !== null) {
      setShowHint(true);
      setCanShowHint(false);
      setTimeout(() => setShowHint(false), 3000);

      // Deduct points for using hint
      const newScore = Math.max(0, score - 2); // Deduct 2 points
      setScore(newScore);
    }
  };

  const handleGameOver = (finalScore: number) => {
    if (isLocalStorageAvailable()) {
      try {
        const newLeaderboard = [...leaderboard, { name: userName, score: finalScore }];
        newLeaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem('leaderboard', JSON.stringify(newLeaderboard.slice(0, 10))); // Limiting to top 10 entries
        setLeaderboard(newLeaderboard.slice(0, 10));
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }
    } else {
      console.warn('localStorage is not available');
    }
  };

  const renderLeaderboard = () => {
    if (leaderboard.length === 0) {
      return (
        <div className="mt-8 w-full max-w-xl">
          <h2 className="text-3xl font-bold mb-4 text-[#a25fbf]">Leaderboard</h2>
          <p className="text-lg text-gray-800">No scores yet.</p>
        </div>
      );
    }

    return (
      <div className="mt-8 w-full max-w-xl">
        <h2 className="text-3xl font-bold mb-4 text-[#a25fbf]">Leaderboard</h2>
        <ul className="bg-white p-6 rounded-lg shadow-lg">
          {leaderboard.map((entry, index) => (
            <li
              key={index}
              className={`flex justify-between text-lg text-gray-800 mb-2 ${index === 0 ? 'leaderboard-item' : ''}`}
            >
              <span>{entry.name}</span>
              <span>{entry.score}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4">
      {gameState === 'start' && (
        <h1 className="xl:text-5xl text-3xl font-bold text-white mb-8 animate__animated animate__bounceIn">Fun Quizzes</h1>
      )}

      {gameState === 'start' && (
        <div className="w-full max-w-xl bg-white p-8 rounded-lg shadow-xl animate__animated animate__fadeIn">
          <div className="mb-6 animate__animated animate__bounceInLeft">
            <label className="block text-lg font-semibold text-gray-700">Enter your name:</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="text-black w-full border border-gray-300 p-3 rounded mt-2 focus:outline-none "
            />
          </div>
          <button
            onClick={handleStart}
            className="w-full bg-[#ff3835] text-white py-3 rounded shadow hover:bg-[#a25fbf] transition duration-200 transform hover:scale-105 animate__animated animate__bounceInUp"
          >
            Start Game
          </button>

          {showValidationMessage && (
            <div className="text-red-600 text-sm mt-4 animate__animated animate__shakeX">
              Please enter your name to start the game.
            </div>
          )}
        </div>
      )}

      {gameState === 'playing' && currentQuestionIndex !== null && (
        <div className="mt-8 w-full max-w-xl bg-white p-8 rounded-lg shadow-xl text-center animate__animated animate__fadeIn">
          <div className="mb-4 text-right text-gray-700 font-semibold animate__animated animate__bounceInRight">
            Timer: {timer}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 animate__animated animate__bounceInLeft">
            Question {currentQuestionIndex + 1}
          </h2>
          <p className="text-lg text-gray-800 mb-6 animate__animated animate__bounceInRight">
            {currentQuestions[currentQuestionIndex].content}
          </p>

          {currentQuestions[currentQuestionIndex].options?.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className={`mb-4 p-3 rounded-lg w-full text-left ${
                selectedOption === option
                  ? option.toLowerCase().trim() ===
                    currentQuestions[currentQuestionIndex].answer.toLowerCase().trim()
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              } transition duration-200 transform hover:scale-105 animate__animated animate__fadeIn`}
              disabled={selectedOption !== null}
            >
              {option}
            </button>
          ))}

          {['fill'].includes(currentQuestions[currentQuestionIndex].type) && (
            <div className="flex flex-col animate__animated animate__fadeIn">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="text-black border border-gray-300 p-3 rounded mb-4 focus:outline-none "
              />
              <button
                onClick={() => handleAnswer(userAnswer)}
                className="bg-[#ff3835] text-white px-4 py-3 rounded shadow hover:bg-[#a25fbf] transition duration-200 transform hover:scale-105 animate__animated animate__fadeIn"
              >
                Submit
              </button>
            </div>
          )}

          <div className="flex justify-between mt-6  gap-10">
            <button
              onClick={handleChangeQuestion}
              className={`bg-[#82b1ff] text-white px-4 py-2 rounded shadow hover:bg-[#5371a3] transition duration-200 transform hover:scale-105 animate__animated animate__fadeIn ${
                !canChangeQuestion ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!canChangeQuestion}
            >
              Change Question 
            </button>
            <button
              onClick={handleHint}
              className={`bg-[#82b1ff] text-white px-4 py-2 rounded shadow hover:bg-[#5371a3] transition duration-200 transform hover:scale-105 ml-5 animate__animated animate__fadeIn ${
                !canShowHint ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!canShowHint}
            >
               Hint 
            </button>
          </div>
          {showHint && (
            <p className="mt-4 text-sm text-gray-700 animate__animated animate__fadeIn">
              {currentQuestions[currentQuestionIndex].hint}
            </p>
          )}

          <div className="mt-8">
            <p className="text-xl font-semibold text-gray-800">Score: {score}</p>
            <p className="text-lg text-gray-600">Highest Score: {highestScore}</p>
          </div>
        </div>
      )}

      {gameState === 'won' && (
        <div className="mt-8 w-full max-w-xl text-center bg-white p-8 rounded-lg shadow-xl animate__animated animate__fadeIn">
          <h2 className="text-3xl font-bold mb-4 text-[#007a6a] animate__animated animate__bounceIn">
            Congratulations!
          </h2>
          <p className="text-lg text-gray-800 animate__animated animate__fadeIn">
            You have completed the game with a score of {score}.
          </p>
          <button
            onClick={handlePlayAgain}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-[#007a6a] transition duration-200 transform hover:scale-105 mt-4 animate__animated animate__bounceIn"
          >
            Play Again
          </button>
          {renderLeaderboard()}
        </div>
      )}

      {gameState === 'lost' && (
        <div className="mt-8 w-full max-w-xl text-center bg-white p-8 rounded-lg shadow-xl animate__animated animate__fadeIn">
          <h2 className="text-3xl font-bold mb-4 text-red-700 animate__animated animate__bounceIn">Game Over!</h2>
          <p className="text-lg text-gray-800 animate__animated animate__fadeIn">
            You lost the game. Better luck next time!
          </p>
          <button
            onClick={handlePlayAgain}
            className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition duration-200 transform hover:scale-105 mt-4 animate__animated animate__bounceIn"
          >
            Play Again
          </button>
          {renderLeaderboard()}
        </div>
      )}
    </div>
  );
};

export default Game;
