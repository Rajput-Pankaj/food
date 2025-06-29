import React from 'react'
import { LuLeafyGreen } from "react-icons/lu";

function Card({ name, image, price, type, onAddToCart }) {
  return (
    <div className='w-[300px] h-[400px] bg-white p-3 rounded-lg flex flex-col gap-3 shadow-lg hover:shadow-xl transition-all duration-300'>
        <div className='w-[100%] h-[60%] overflow-hidden rounded-lg'>
            <img src={image} alt={name} className='object-cover w-full h-full hover:scale-110 transition-transform duration-300' />
        </div>
        <div className='text-2xl font-semibold'>
            {name}
        </div>
        <div className='w-full flex justify-between items-center'>
            <div className='text-lg font-bold text-green-500'>Rs.{price}/-</div>
            <div className='flex justify-center items-center gap-2 text-green-500 text-lg font-semibold'>
              <LuLeafyGreen />
              <span>{type}</span>
            </div>
        </div>
        <button 
          className='w-full p-3 bg-green-300 text-gray-700 rounded-lg hover:bg-green-400 cursor-pointer transition-all font-semibold'
          onClick={onAddToCart}
        >
          Add to Cart
        </button>
    </div>
  )
}

export default Card;
