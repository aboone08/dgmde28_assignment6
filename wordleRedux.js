import React, { useEffect, useState } from "react";

const API_URL = "https://random-word-api.herokuapp.com/word?length=5";
const DICTIONARY_API = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function WordleGame() {
  const [answer, setAnswer] = useState("");
  const [guess, setGuess] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(6);
  const [usedLetters, setUsedLetters] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [message, setMessage] = useState("");
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    fetchWord();
  }, []);

  const fetchWord = () => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        const word = data[0].toUpperCase();
        setAnswer(word);
        if (debugMode) alert(`Debug Mode: The answer is ${word}`);
      })
      .catch(() => setAnswer("APPLE"));
  };

  const validateWord = async (word) => {
    try {
      const res = await fetch(DICTIONARY_API + word.toLowerCase());
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleGuess = async () => {
    if (!/^[A-Z]{5}$/.test(guess)) {
      alert("Please enter a valid 5-letter word.");
      return;
    }

    // word validation
    const isValid = await validateWord(guess);
    if (!isValid) {
      alert("Not a valid dictionary word.");
      return;
    }
    
    //For each letter in the guess, you must report one of three results: 
    const newUsed = [...usedLetters];
    const result = guess.split("").map((letter, i) => {
      newUsed.push(letter);
      if (letter === answer[i]) return { letter, status: "letter is in the correct place" }; //if the letter is in the same place as in the guess word
      else if (answer.includes(letter)) return { letter, status: "letter is in the wrong place" }; // if the letter is in the answer but in a different place than in your guess word
      else return { letter, status: "letter not in word" }; //if the letter is not in the answer
    });

    //The game ends when the user guesses the word or uses all 6 guesses.
    setGuesses([...guesses, result]);
    setUsedLetters([...new Set(newUsed)]);
    setGuess("");

    if (guess === answer) {
      setMessage(`Congratulations! You guessed ${answer}.`); 
    } else if (attemptsLeft - 1 === 0) {
      setMessage(`Game Over! The word was ${answer}.`);
    }

    setAttemptsLeft(attemptsLeft - 1);
  };

  const restartGame = () => {
    setGuess("");
    setAttemptsLeft(6);
    setUsedLetters([]);
    setGuesses([]);
    setMessage("");
    fetchWord();
  };

  return React.createElement("div", { className: "p-4 max-w-xl mx-auto" }, [
    React.createElement("h1", { className: "text-2xl font-bold mb-4", key: "title" }, "Wordle Game"),

    React.createElement("div", { className: "space-y-2 mb-4", key: "guesses" },
      guesses.map((result, i) =>
        React.createElement("div", { key: i, className: "flex gap-2" },
          result.map((r, j) =>
            React.createElement("span", {
              key: j,
              className: `p-2 rounded text-white ${
                r.status === "correct" ? "bg-green-500" :
                r.status === "misplaced" ? "bg-yellow-500" :
                "bg-gray-500"}`
            }, r.letter)
          )
        )
      )
    ),

    React.createElement("input", {
      type: "text",
      maxLength: 5,
      value: guess,
      onChange: e => setGuess(e.target.value.toUpperCase()),
      className: "border p-2 mr-2",
      disabled: message !== "",
      key: "input"
    }),

    React.createElement("button", {
      onClick: handleGuess,
      disabled: message !== "" || guess.length !== 5,
      className: "bg-blue-500 text-white px-4 py-2 rounded",
      key: "guess-btn"
    }, "Guess"),

    React.createElement("div", { className: "mt-4", key: "used-letters" }, [
      React.createElement("p", { key: "used" },
        React.createElement("strong", null, "Used Letters:"),
        ` ${usedLetters.join(", ") || "None"}`
      ),
      message && React.createElement("p", { className: "mt-2 font-bold", key: "msg" }, message)
    ]),

    React.createElement("div", { className: "mt-4", key: "controls" }, [
      React.createElement("button", {
        onClick: restartGame,
        className: "bg-gray-300 px-3 py-1 rounded",
        key: "restart"
      }, "Restart"),

      React.createElement("label", { className: "ml-4", key: "debug-label" }, [
        React.createElement("input", {
          type: "checkbox",
          checked: debugMode,
          onChange: (e) => setDebugMode(e.target.checked),
          key: "debug-toggle"
        }),
        " Debug Mode"
      ])
    ]),

    React.createElement("div", { className: "grid grid-cols-13 gap-1 mt-4", key: "keyboard" },
      ALPHABET.split("").map(letter => {
        const status = guesses.flat().find(g => g.letter === letter)?.status;
        let color = "bg-white";
        if (status === "correct") color = "bg-green-500 text-white";
        else if (status === "misplaced") color = "bg-yellow-500 text-white";
        else if (status === "wrong") color = "bg-gray-500 text-white";

        return React.createElement("div", {
          key: letter,
          className: `text-center border p-2 rounded ${color}`
        }, letter);
      })
    )
  ]);
}

window.WordleGame = WordleGame;
