import React, { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom';

import './../index.css'
import { FaShoppingCart } from 'react-icons/fa'
import Order from './Order'


import { ACCES_TOKEN } from '../constants'


const showOrders = (props) => {
  let summa = 0
  props.orders.forEach(el => summa += Number.parseFloat(el.price));
  
  return (
    <div>
      {props.orders.map(el => (
        <Order onDelete={props.onDelete} key={el.id} item={el} />
      ))}

      <p className='summa'>Total: {new Intl.NumberFormat().format(summa)}$</p>

    </div>
  )
}

const showNothing = () => {
  return (
    <div className='empty'>
      <h2>No products in a cart</h2>
    </div>
  )
}



export default function Header(props) {
  let [cartOpen, setCartOpen] = useState(false)

  return (
    <header >
        <div>
            <div className="flex flex-row items-center justify-between">
              <span className="logo ml-4">Recape</span>
              <ul className="nav flex flex-row space-x-6">
                  <FaShoppingCart onClick={() => setCartOpen(!cartOpen)} className={`shop-cart-button ${cartOpen && 'active'}`} />

                  <Link to="/About">About</Link>

                  <Link to="/contact">Contact</Link>

                  {localStorage.getItem(ACCES_TOKEN) ? (
                    <Link to="/settings">Settings</Link>
                  ) : (
                    <Link to="/login">Login</Link>
                  )}
              </ul>
            </div>
              {cartOpen && (
                <div className='shop-cart'>
                  {props.orders.length > 0 ?
                    showOrders(props) : showNothing()}
                </div>
              )}
        </div>
        <div className='presentation'></div>
    </header>
  )
}
