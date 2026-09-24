import React, { useEffect, useState } from "react";
import api from "../api/axios";

const Profile = () => {
  const [user, setUser] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [profileImg, setProfileImg] = useState("");

  useEffect(() => {
    async function getprofile() {
      try {
        const res = await api.get("/profile");

        setUser([res.data]);

        if (res.data.profileImage) {
          setProfileImg(res.data.profileImage);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
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

    try {
      const res = await api.post("/upload-profile", formdata);

      console.log(res.data?.profileImage);

      setProfileImg(res.data?.profileImage);

      alert("Profile picture uploaded successfully");
    } catch (error) {
      console.error("Profile upload error:", error);
      alert("Failed to upload profile picture");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-md sm:p-8">

        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Profile
        </h1>

        {user.map((ele, key) => (
          <div key={key} className="mb-6 text-center">

            {profileImg ? (
              <img
                src={profileImg}
                alt="Profile"
                className="mx-auto mb-4 h-32 w-32 rounded-full object-cover"
              />
            ) : (
              <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-gray-300 text-4xl font-bold text-gray-600">
                {ele.name?.charAt(0).toUpperCase()}
              </div>
            )}

            <h2 className="text-xl font-semibold text-gray-700">
              {ele.name}
            </h2>

            <p className="mt-1 break-all text-gray-500">
              {ele.email}
            </p>
          </div>
        ))}

        <div className="border-t pt-6">

          <label className="mb-2 block text-sm font-medium text-gray-700">
            Profile Picture
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="w-full text-sm text-gray-600
                       file:mr-4 file:rounded-lg file:border-0
                       file:bg-gray-200 file:px-4 file:py-2
                       file:text-gray-700
                       hover:file:bg-gray-300"
          />

          <button
            onClick={uploadprofile}
            className="mt-4 w-full rounded-lg bg-blue-600 py-2
                       text-white transition hover:bg-blue-700"
          >
            Upload
          </button>

        </div>
      </div>
    </div>
  );
};

export default Profile;

