'use client';

import Image from 'next/image';
import { useState } from 'react';

const Game = () => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost'>('start');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const questions = [
    { type: 'mcq', content: 'What is 2 + 2?', options: ['3', '4', '5'], answer: '4' },
    { type: 'fill', content: 'The capital of France is ___', answer: 'paris' },
    { type: 'riddle', content: 'I speak without a mouth and hear without ears. What am I?', answer: 'echo' },
    { type: 'emoji', content: 'What does this emoji mean? 😊', options: ['Happy', 'Sad', 'Angry'], answer: 'Happy' },
    { type: 'english', content: 'Choose the correct spelling:', options: ['Recieve', 'Receive', 'Recievee'], answer: 'Receive' },
    { type: 'mcq', content: 'What is 5 + 3?', options: ['7', '8', '9'], answer: '8' },
    { type: 'fill', content: 'The capital of Japan is ___', answer: 'tokyo' },
    { type: 'riddle', content: 'I have keys but no locks. I have space but no room. You can enter, but you can’t go outside. What am I?', answer: 'keyboard' },
    { type: 'emoji', content: 'What does this emoji mean? 😂', options: ['Laughing', 'Crying', 'Angry'], answer: 'Laughing' },
  ];

  const startGame = () => {
    setGameState('playing');
    setSelectedNumbers([]);
    setCurrentQuestionIndex(null);
    setScore(0);
    setUserAnswer('');
    setSelectedOption(null);
  };

  const handleNumberClick = (number: number) => {
    if (!selectedNumbers.includes(number)) {
      setSelectedNumbers([...selectedNumbers, number]);
      setCurrentQuestionIndex(number - 1);
      setSelectedOption(null);
    }
  };

  const handleOptionClick = (option: string) => {
    setUserAnswer(option);
    setSelectedOption(option);
  };

  const handleSubmitAnswer = () => {
    const question = questions[currentQuestionIndex!];
    if (question.answer.toLowerCase() === userAnswer.trim().toLowerCase()) {
      setScore(score + 1);
      if (selectedNumbers.length >= 9) {
        setGameState('won');
      } else {
        setCurrentQuestionIndex(null);
        setUserAnswer('');
        setSelectedOption(null);
      }
    } else {
      setGameState('lost');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {gameState === 'start' && (
        <div className="flex flex-col items-center bg-white p-8 rounded shadow-lg">
          <h1 className="text-3xl font-bold mb-4">Welcome to the Quiz Game</h1>
          <p className="mb-4 text-center text-gray-700">Test your knowledge with fun questions and puzzles!</p>
          <button
            className="px-6 py-3 font-semibold text-white bg-black rounded hover:bg-white hover:text-black transition duration-300 ease-in-out transform hover:scale-105"
            onClick={startGame}
          >
            Start Game
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full max-w-md">
          <div className="text-2xl font-bold mb-4 text-center text-black">Score: {score}</div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
              <button
                key={number}
                className={`px-4 py-2 font-semibold rounded ${selectedNumbers.includes(number) ? 'bg-gray-400 cursor-not-allowed' : 'text-white bg-green-500 cursor-pointer hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105'}`}
                onClick={() => handleNumberClick(number)}
                disabled={selectedNumbers.includes(number)}
              >
                {number}
              </button>
            ))}
          </div>

          {currentQuestionIndex !== null && (
            <div className="mt-4 p-4 bg-white  rounded shadow-lg transition duration-500 ease-in-out transform">
              <p className="mb-4 text-lg ">{questions[currentQuestionIndex].content}</p>
              {['mcq', 'emoji', 'english'].includes(questions[currentQuestionIndex].type) && (
                <div className="mt-2 flex flex-col gap-2 text-black">
                  {questions[currentQuestionIndex].options?.map((option, index) => (
                    <button
                      key={index}
                      className={`px-4 py-2 mt-2 font-semibold rounded ${selectedOption === option ? 'bg-yellow-500' : 'bg-purple-500 text-white'} hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105`}
                      onClick={() => handleOptionClick(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {['fill', 'riddle'].includes(questions[currentQuestionIndex].type) && (
                <input
                  type="text"
                  className="px-4 py-2 mt-2 border rounded w-full"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                />
              )}

              <button
                className="px-4 py-2 mt-4 font-semibold text-white bg-black rounded hover:bg-white hover:text-black transition duration-300 ease-in-out transform hover:scale-105"
                onClick={handleSubmitAnswer}
              >
                Submit Answer
              </button>
            </div>
          )}
        </div>
      )}

      {gameState === 'won' && (
        <div className="flex flex-col items-center animate-bounce">
          <p className="text-xl font-bold text-green-500 mb-4">You Won!</p>
          <Image src="https://media.giphy.com/media/1GTZA4flUzQI0/giphy.gif" width={256} height={256} alt="You won gif" />
          <p className="text-xl font-bold mt-4">Your Final Score: {score}</p>
          <button
            className="px-6 py-3 mt-4 font-semibold text-white bg-black rounded hover:bg-white hover:text-black transition duration-300 ease-in-out transform hover:scale-105"
            onClick={startGame}
          >
            Play Again
          </button>
        </div>
      )}

      {gameState === 'lost' && (
        <div className="flex flex-col items-center animate-pulse">
          <p className="text-xl font-bold text-red-500 mb-4">You Lost!</p>
          <Image src="https://media.giphy.com/media/mxXPuScIwPwK2oyD6i/giphy.gif" width={256} height={256} alt="You lost gif" />
          <p className="text-xl font-bold mt-4 text-black">Your Final Score: {score}</p>
          <button
            className="px-6 py-3 mt-4 font-semibold text-white bg-black rounded hover:bg-white hover:text-black transition duration-300 ease-in-out transform hover:scale-105"
            onClick={startGame}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;
