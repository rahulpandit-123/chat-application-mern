import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <div style={{ marginTop:"30px",marginBottom:"20px"}}>
        <Link to='/'>Home</Link>

        |
        <Link to='/login'>Login</Link>

        |
        <Link to='/profile'>Profile</Link>

    </div>
  )
}

export default Navbar