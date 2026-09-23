import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [profileImg, setProfileImg] = useState("");

  useEffect(() => {
    async function getprofile() {
      const res = await axios.get("http://localhost:3000/profile", {
        withCredentials: true,
      });

      setUser([res.data]);
      if (res.data.profileImage) {
       setProfileImg(res.data.profileImage);
        }
    }

    getprofile();
  }, []);

  const uploadprofile = async () => {
    if (!selectedFile) {
      alert("Please select a profile picture");
      return;
    }

    const formdata = new FormData();
    formdata.append("profile", selectedFile);

    const res = await axios.post(
      "http://localhost:3000/upload-profile",
      formdata , {
    withCredentials: true
  }
    );

    console.log(res.data?.profileImage);
    setProfileImg(res.data?.profileImage);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-md">

        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Profile
        </h1>

        {user.map((ele, key) => (
          <div key={key} className="text-center mb-6">
             
            {profileImg && (
              <img
                src={profileImg}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
              />
            )}

            <h2 className="text-xl font-semibold text-gray-700">
              {ele.name}
            </h2>

            <p className="text-gray-500 mt-1">
              {ele.email}
            </p>
          </div>
        ))}

        <div className="border-t pt-6">

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="w-full text-sm text-gray-600
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-lg file:border-0
                       file:bg-gray-200 file:text-gray-700
                       hover:file:bg-gray-300"
          />

          <button
            onClick={uploadprofile}
            className="w-full mt-4 bg-blue-600 text-white py-2
                       rounded-lg hover:bg-blue-700 transition"
          >
            Upload
          </button>

        </div>
      </div>
    </div>
  );
};

export default Profile;