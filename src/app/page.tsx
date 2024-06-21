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
  const [category, setCategory] = useState<string>('');
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
    if (category && questionsData[category as keyof typeof questionsData]) {
      if (isLocalStorageAvailable()) {
        try {
          const storedScores = JSON.parse(localStorage.getItem(`leaderboard_${category}`) || '[]') as LeaderboardEntry[];
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
  }, [category]);

  useEffect(() => {
    if (gameState === 'playing' && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (timer === 0) {
      setGameState('lost');
      handleGameOver();
    }
  }, [gameState, timer]);

  const handleAnswer = (selected: string) => {
    if (gameState !== 'playing' || currentQuestionIndex === null) return;

    const currentQuestion = currentQuestions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer.toLowerCase().trim(); // Trim correct answer

    // Trim user's answer and compare ignoring spaces
    const userAnswerTrimmed = selected.toLowerCase().trim();
    const correct = userAnswerTrimmed === correctAnswer;

    setSelectedOption(selected);
    setTimeout(() => {
      if (correct) {
        setScore((prevScore) => prevScore + 1);

        if (currentQuestionIndex === currentQuestions.length - 1) {
          setGameState('won');
        } else {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedOption(null);
          setUserAnswer('');
        }
      } else {
        setGameState('lost');
        handleGameOver();
      }
      setTimer(30);
    }, 1000);
  };

  const handleStart = () => {
    if (!userName || !category) {
      setShowValidationMessage(true);
      return;
    }

    try {
      const shuffledQuestions = (questionsData as { [key: string]: Question[] })[category].sort(() => Math.random() - 0.5);
      setCurrentQuestions(shuffledQuestions);
      setShowValidationMessage(false);
      setGameState('playing');
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedOption(null);
      setUserAnswer('');
      setTimer(30);
      setCanChangeQuestion(true);
      setCanShowHint(true);
    } catch (error) {
      console.error('Error starting the game:', error);
    }
  };

  const handlePlayAgain = () => {
    setGameState('start');
    setUserName('');
    setCategory('');
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
    }
  };

  const handleHint = () => {
    if (canShowHint && currentQuestionIndex !== null) {
      setShowHint(true);
      setCanShowHint(false);
      setTimeout(() => setShowHint(false), 3000);
    }
  };

  const handleGameOver = () => {
    if (isLocalStorageAvailable()) {
      try {
        const newLeaderboard = [...leaderboard, { name: userName, score }];
        newLeaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem(`leaderboard_${category}`, JSON.stringify(newLeaderboard));
        setLeaderboard(newLeaderboard);
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }
    } else {
      console.warn('localStorage is not available');
    }
  };

  const renderLeaderboard = () => {
    if (!category || leaderboard.length === 0) {
      return (
        <div className="mt-8 w-full max-w-xl">
          <h2 className="text-3xl font-bold mb-4 text-blue-700">Leaderboard</h2>
          <p className="text-lg text-gray-800">No scores yet for this category.</p>
        </div>
      );
    }

    return (
      <div className="mt-8 w-full max-w-xl">
        <h2 className="text-3xl font-bold mb-4 text-blue-700">Leaderboard - {category.charAt(0).toUpperCase() + category.slice(1)}</h2>
        <ul className="bg-white p-6 rounded-lg shadow-lg">
          {leaderboard.map((entry, index) => (
            <li key={index} className="flex justify-between text-lg text-gray-800 mb-2">
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
      <h1 className="text-4xl font-bold text-white mb-8 animate__animated animate__bounceIn">Fun Quizzes</h1>

      {gameState === 'start' && (
        <div className="w-full max-w-xl bg-white p-8 rounded-lg shadow-xl animate__animated animate__fadeIn">
          <div className="mb-6 animate__animated animate__bounceInLeft">
            <label className="block text-lg font-semibold text-gray-700">Enter your name:</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="text-black w-full border border-gray-300 p-3 rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6 animate__animated animate__bounceInRight">
            <label className="block text-lg font-semibold text-gray-700">Select a category:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option className="text-black" value="">Choose a category</option>
              {Object.keys(questionsData).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleStart}
            className="w-full bg-blue-600 text-white py-3 rounded shadow hover:bg-blue-700 transition duration-200 transform hover:scale-105 animate__animated animate__bounceInUp"
          >
            Start Game
          </button>

          {showValidationMessage && (
            <div className="text-red-600 text-sm mt-4 animate__animated animate__shakeX">
              Please enter your name and select a category to start the game.
            </div>
          )}
        </div>
      )}

      {gameState === 'playing' && currentQuestionIndex !== null && (
        <div className="mt-8 w-full max-w-xl bg-white p-8 rounded-lg shadow-xl text-center animate__animated animate__fadeIn">
          <div className="mb-4 text-right text-gray-700 font-semibold animate__animated animate__fadeInUp">Time left: {timer} seconds</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4 animate__animated animate__fadeIn">{currentQuestions[currentQuestionIndex].content}</h3>
          {currentQuestions[currentQuestionIndex].options?.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className={`mb-4 p-3 rounded-lg w-full text-left ${
                selectedOption === option
                  ? option.toLowerCase().trim() === currentQuestions[currentQuestionIndex].answer.toLowerCase().trim()
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              } transition duration-200 transform hover:scale-105 animate__animated animate__fadeIn`}
              disabled={selectedOption !== null}
            >
              {option}
            </button>
          ))}

          {['fill', 'riddle'].includes(currentQuestions[currentQuestionIndex].type) && (
            <div className="flex flex-col animate__animated animate__fadeIn">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="text-black border border-gray-300 p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleAnswer(userAnswer)}
                className="bg-blue-600 text-white px-4 py-3 rounded shadow hover:bg-blue-700 transition duration-200 transform hover:scale-105 animate__animated animate__fadeIn"
              >
                Submit
              </button>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={handleChangeQuestion}
              className={`bg-yellow-400 text-white px-4 py-2 rounded shadow hover:bg-yellow-500 transition duration-200 transform hover:scale-105 ml-5 ${!canChangeQuestion ? 'opacity-50 cursor-not-allowed' : ''} animate__animated animate__fadeIn`}
              disabled={!canChangeQuestion}
            >
              Change Question
            </button>
            <button
              onClick={handleHint}
              className={`bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 transition duration-200 transform hover:scale-105 ml-5 ${!canShowHint ? 'opacity-50 cursor-not-allowed' : ''} animate__animated animate__fadeIn`}
              disabled={!canShowHint}
            >
              Show Hint
            </button>
          </div>
          {showHint && <p className="mt-4 text-sm text-gray-700 animate__animated animate__fadeIn">{currentQuestions[currentQuestionIndex].hint}</p>}
        </div>
      )}

      {gameState === 'won' && (
        <div className="mt-8 w-full max-w-xl text-center bg-white p-8 rounded-lg shadow-xl animate__animated animate__fadeIn">
          <h2 className="text-3xl font-bold mb-4 text-green-700 animate__animated animate__bounceIn">Congratulations!</h2>
          <p className="text-lg text-gray-800 animate__animated animate__fadeIn">You have completed the game with a score of {score}.</p>
          <button
            onClick={handlePlayAgain}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition duration-200 transform hover:scale-105 mt-4 animate__animated animate__bounceIn"
          >
            Play Again
          </button>
          {renderLeaderboard()}
        </div>
      )}

      {gameState === 'lost' && (
        <div className="mt-8 w-full max-w-xl text-center bg-white p-8 rounded-lg shadow-xl animate__animated animate__fadeIn">
          <h2 className="text-3xl font-bold mb-4 text-red-700 animate__animated animate__bounceIn">Game Over!</h2>
          <p className="text-lg text-gray-800 animate__animated animate__fadeIn">You lost the game. Better luck next time!</p>
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
