function Profile() {
  const profile = {
    name: "Phí Trường",
    age: 24,
    email: "pro@example.com",
    dob: "2001-11-21",
    carName: "Honda Civic",
    avatar:
      "https://ui-avatars.com/api/?name=Phi+Truong&background=2bf0b5&color=fff",
  };


  
  return (
    <div className="fixed top-4 right-4">
      <div className="bg-white p-6 rounded-md shadow-md w-96 text-center">
        <img
          src={profile.avatar}
          alt="Avatar"
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />
        <h2 className="text-xl font-bold mb-2">{profile.name}</h2>
        <p className="text-gray-600">Tuổi: {profile.age}</p>
        <p className="text-gray-600">Email: {profile.email}</p>
        <p className="text-gray-600">
          Ngày sinh: {new Date(profile.dob).toLocaleDateString("vi-VN")}
        </p>
        <p className="text-gray-600">Xe sở hữu: {profile.carName}</p>
      </div>
    </div>
  );
}

export default Profile;
