import React from "react";
import Login from "./Login";
const Home = () => {
  return (
    <div className="min-h-screen bg-gray-200 px-4 py-8">
      {" "}
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
        {" "}
        {/* Welcome Section */}{" "}
        <div className="mb-8 flex flex-col items-center text-center">
          {" "}
          <h3 className="mb-4 text-3xl font-bold text-black sm:text-4xl lg:text-5xl">
            {" "}
            My Chat App{" "}
          </h3>{" "}
          <p className="max-w-md text-base leading-7 text-gray-600 sm:text-lg">
            {" "}
            Hi, welcome to my chat app where you can chat with others in real
            time...{" "}
          </p>{" "}
        </div>{" "}
        {/* Login */}{" "}
        <div className="flex w-full justify-center">
          {" "}
          <Login />{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default Home;
