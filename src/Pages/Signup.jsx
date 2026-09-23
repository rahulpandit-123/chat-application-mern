import React, { useState } from "react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("rahul");
  const [email, setEmail] = useState("rahulpandit3154@gmail.com");
  const [password, setPassword] = useState("12345");
  const [repassword, setRepassword] = useState("12345");

  const navigate = useNavigate()
  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== repassword) {
      alert("Passwords do not match");
      return;
    }
    const obj = {name,email,password}

    axios.post("http://localhost:3000/adduser",obj)
    navigate("/login")

  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{display:"flex",flexDirection:"column",gap:"15px",height:"70vh",justifyContent:"center",alignItems:"center"}}
    >
      <input
        type="text"
        style={{ padding: "8px" }}
        placeholder="Enter Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        style={{ padding: "8px" }}
        placeholder="Enter Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        style={{ padding: "8px" }}
        placeholder="Enter Your Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        style={{ padding: "8px" }}
        placeholder="Re-Enter Your Password"
        value={repassword}
        onChange={(e) => setRepassword(e.target.value)}
      />

      <button type="submit" style={{ padding: "9px" ,color:"white",backgroundColor:"black"}}>
        Signup
      </button>
    </form>
  );
};

export default Signup;