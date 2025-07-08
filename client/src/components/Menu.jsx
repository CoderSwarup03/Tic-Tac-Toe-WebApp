import React from 'react'

const Menu = ({createRoom, joinRoom}) => {
    return (
        <>
            <div className='flex justify-center items-center gap-5 lg:flex-row sm:flex-col flex-wrap'>
                <button onClick={createRoom} className='bg-white hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg shadow-lg transition-all font-bold cursor-pointer'>Create Room</button>
                <button onClick={joinRoom} className='bg-yellow-500 hover:bg-yellow-700 text-gray-800 py-2 px-4 rounded-lg shadow-lg transition-all font-bold cursor-pointer'>Join Room</button>
            </div>
        </>
    )
}

export default Menu