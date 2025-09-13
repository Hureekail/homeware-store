import React, { useState } from 'react'
import './../index.css'
import { FaSearch } from 'react-icons/fa'

const SearchBar = ({ items, onSearch }) => {
  const [searchValue, setSearchValue] = useState("")

  const handleChange = (e) => {
    const value = e.target.value
    setSearchValue(value)
    
    if (value.trim()) {
      const filtered = items.filter(item => 
        item.name.toLowerCase().includes(value.toLowerCase())
      )
      onSearch(filtered)
    } else {
      onSearch(items)
    }
  }

  return (
    <div className="search-bar-container">
      <div className='input-wrapper'>
        <FaSearch id="search-icon"/>
        <input 
          placeholder='Type to search...' 
          value={searchValue} 
          onChange={handleChange}
        />
      </div>
    </div>
  )
}

export default SearchBar
