


function Profile({profileData}) {
  const profile = JSON.parse(localStorage.getItem("profile"));
  return (
    <div className="fixed top-4 right-4">
      <div className="bg-white p-6 rounded-md shadow-md w-96 text-center">
        <img
          src={profileData.avatar}
          alt="Avatar"
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />
        <h2 className="text-xl font-bold mb-2">{profileData.name}</h2>
        <p className="text-gray-600">Tuổi: {profileData.age}</p>
        <p className="text-gray-600">Email: {profileData.email}</p>
        <p className="text-gray-600">
          Ngày sinh: {new Date(profileData.dob).toLocaleDateString("vi-VN")}
        </p>
        <p className="text-gray-600">Xe sở hữu: {profile.carName}</p>
      </div>
    </div>
  );
}

export default Profile;
