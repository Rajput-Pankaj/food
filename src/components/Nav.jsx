import React from 'react'
import { MdFastfood } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { LuShoppingBag } from "react-icons/lu";

function Nav({ searchQuery, setSearchQuery, cartItemCount = 0, onCartClick }){
  return (
    <div className='w-full h-[100px] flex justify-between items-center px-5 md:px-8'>
        <div className='w-[60px] h-[60px] bg-white flex justify-center items-center rounded-md shadow-xl'>
            <MdFastfood className='w-[30px] h-[30px] text-green-500' />
        </div>
        <div className='w-[45%] h-[60px] bg-white flex items-center px-5 gap-5 rounded-md shadow-md'>
            <IoSearch className='w-[30px] h-[30px] text-green-500' />
            <input 
              type="text" 
              placeholder='Search Items...' 
              className='w-[100%] outline-none text-[16px] md:text-[20px]' 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <div 
          className='w-[60px] h-[60px] bg-white flex justify-center items-center rounded-md shadow-xl relative cursor-pointer hover:bg-green-50 transition-colors'
          onClick={onCartClick}
        >
            {cartItemCount > 0 && (
              <span className='absolute -top-2 -right-2 bg-red-500 text-white font-bold text-[14px] rounded-full w-6 h-6 flex items-center justify-center'>
                {cartItemCount}
              </span>
            )}
            <LuShoppingBag className='w-[30px] h-[30px] text-green-500' />
        </div>
    </div>
  )
}

export default Nav;
