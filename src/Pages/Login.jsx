import React, { useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import axios from 'axios'

const Login = () => {
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const navigate = useNavigate()

  async function handlelogin (){
   const obj = {email,password}
  const res =  await axios.post("http://localhost:3000/login",obj,{
    withCredentials:true
  }) 
  localStorage.setItem("token",res.data)

    navigate("/chat")
    
  }
  return (
    <div className='py-26.5 border-2 px-35'>
      <h2 className='text-blue-600 py-15 text-3xl ml-20 '>Login</h2>
        <input  style={{padding:"8px" , width:"300px" }} type="email" placeholder='Please Enter Your Email' value={email} onChange={(e)=>setEmail(e.target.value)}/><br /><br />
        <input style={{padding:"8px" , width:"300px"}} placeholder='Please Enter Your Password' type="password" name="" id=""  value={password} onChange={(e)=>setPassword(e.target.value)}/><br /><br />
        <button onClick={handlelogin} style={{ padding:"9px" ,width:"310px",color:"white",backgroundColor:"black",marginBottom:"30px"}} >Login</button>
        <p>Dont have an account? <Link to='/signup'>Signup</Link></p>
    </div>
  )
}

export default Login