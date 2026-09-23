import React from 'react'

import {Routes,Route, Router} from 'react-router-dom'
import Home from './Pages/Home'
import Navbar from './Components/Navbar'
import Login from './Pages/Login'
import Profile from './Pages/Profile'
import Signup from './Pages/Signup'
import Chat from './Pages/Chat'
import Contacts from './Components/Contacts'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<Signup/>} />
        <Route path='/profile' element={<Profile/>} />
        <Route path='/chat' element={<Chat/>} />

      </Routes>
    </div>
  )
}

export default App