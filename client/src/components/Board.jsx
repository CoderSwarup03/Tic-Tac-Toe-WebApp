import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import { toast } from 'react-hot-toast'
import { FaCopy } from 'react-icons/fa';
import Menu from './Menu';

const socket = io('http://localhost:5000')
const initalState = Array(9).fill(null);


const Board = () => {
  const [board, setBoard] = useState(initalState);
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [player, setPlayer] = useState("");
  const [isXTurn, setIsXTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);

  const createRoom = () => {
    socket.emit('createRoom', (id) => {
      setRoomId(id);
      setJoined(true);
      setPlayer('X');
    })
  };

  const joinRoom = () => {
    const id = prompt("Enter room ID");

    if (!id.trim()) {
      toast.error("Enter valid room id");
      return;  // return means from here to stop excution!! 
    }

    socket.emit('joinRoom', id, (res) => {
      if (res.success) {
        setRoomId(id);
        setJoined(true);
        setPlayer('0');
      }
      else {
        toast.error("Failed to join room");
      }
    })
  };

  const isMyTurn = () => {
    return (isXTurn && player === 'X') || (!isXTurn && player === '0');
  };

  const checkWiner = (board) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    // each lines one by one check karega
    for (const line of lines) {
      // this [a, b, c] called is destructuring array
      const [a, b, c] = line;

      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        setWinningLine(line);
        return;
      }
    }
  };

  // Boxes click per jo x or o perform hoga or index grap karega!!
  const handleClick = (idx) => {
    if (board[idx] || !isMyTurn || winner) return;
    const newBoard = [...board];
    newBoard[idx] = player;
    setBoard(newBoard);
    socket.emit('makeMove', { roomId, index: idx, player });
    checkWiner(newBoard);
    setIsXTurn(!isXTurn);
  };

  // for side effect perform!!
  useEffect(() => {
    socket.on("opponentMove", ({ index, player: p }) => {
      const newBoard = [...board];
      newBoard[index] = p;
      setBoard(newBoard);
      setIsXTurn(!isXTurn);
      checkWiner(newBoard);
    })
    return () => {
      socket.off("opponentMove");
    }

  }, [isXTurn, board])  // []- array means is this is depenedency array

  // when click the text(ex:room_id) then text is copy
  const copyText = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied to clipboard");
  }

  const handleRematch = () => {
    setBoard(initalState);
    setWinner(null);
    setWinningLine([]);
    setIsXTurn(true);
    socket.emit('rematch', roomId);
  }
  // opponent rematch then use useEffect
  useEffect(() => {
    socket.on('rematch', () => {
      setBoard(initalState);
      setWinner(null);
      setWinningLine([]);
      setIsXTurn(true);
      toast.success("Opponent accepted rematch");
    })
    return () => socket.off('rematch')
  }, [])

  return (
    <>
      <div className='flex flex-col items-center justify-center min-h-screen bg-[#101029] text-white'>
        <h1 className='text-4xl font-extrabold mb-4 drop-shadow-lg'>Tic Tac Toe</h1>
        {
          !joined ? <Menu createRoom={createRoom} joinRoom={joinRoom} /> :
            <>
              <div className='flex justify-center items-center gap-5'>
                <span className='bg-white text-gray-800 py-2 px-3 rounded-lg shadow-lg font-mono cursor-pointer'>Room ID: {roomId}</span>
                <FaCopy onClick={copyText} className='text-yellow-300 hover:text-yellow-500 cursor-pointer text-xl' />
              </div>

              {/* Board */}
              <div className='grid grid-cols-3 gap-4 mt-5 sm:gap-2'>
                {
                  board.map((cell, idx) => {
                    return (
                      <button
                        key={idx}
                        onClick={() => handleClick(idx)}
                        className={`bg-white w-24 h-24 text-gray-800 font-bold flex items-center justify-center shadow-lg rounded-lg ${winningLine.includes(idx) ? 'bg-yellow-400 text-yellow-800' : ''}${!isMyTurn() || winner || cell ? 'cursor-not-allowed' : 'cursor-pointer transform transition-all hover: scale-105 '}`}
                        disabled={!isMyTurn() || cell || winner}
                      >
                        {cell}
                      </button>
                    );
                  })
                }
              </div>
              {
                winner && <p className='mt-6 bg-yellow-500 rounded-lg px-5 py-1 font-semibold'>{winner} Wins!</p>
              }
              {
                (winner || board.every((cell) => cell)) && (
                  <button onClick={handleRematch} className='bg-yellow-500 hover:bg-yellow-700 text-white py-2 px-4 rounded-md mt-5'>
                    Rematch
                  </button>
                )
              }
              {
                !isMyTurn() && !winner && !board.every((cell) => cell) && <p className='mt-6 text-gray-400'>Waiting for opponent's move...</p>
              }
            </>
        }
      </div>
    </>
  )
}

export default Board

