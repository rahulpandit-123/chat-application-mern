import React from "react";
import Login from "./Login";

const Home = () => {
  return (
    <div
      className="flex h-screen items-center justify-around overflow-hidden bg-gray-200"
    >
      <div className="flex flex-col items-center">
        <h3 className="mb-8 text-4xl font-bold text-black-600">
          My Chat App
        </h3>

        <p className="max-w-md text-center text-lg text-gray-600">
          Hi, welcome to my chat app where you can chat with others in real time...
        </p>
      </div>

      <Login />
    </div>
  );
};

export default Home;