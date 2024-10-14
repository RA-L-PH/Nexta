import { useLocation } from 'react-router-dom';

const Checkout = () => {
  const location = useLocation();
  const { cartItems } = location.state || [];

  return (
    <div className="mx-auto mt-8 w-[calc(100%-40px)] p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Checkout</h1>
      {cartItems.length > 0 ? (
        <ul>
          {cartItems.map((freelancer) => (
            <li key={freelancer.id} className="flex items-center justify-between bg-gray-100 p-4 mb-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <img
                  src={freelancer.doctorDetails?.profilePhoto || '/default-avatar.png'}
                  alt="Doctor profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-semibold">
                    {freelancer.doctorDetails ? freelancer.doctorDetails.name : 'Unknown'}
                  </h2>
                  <p className="text-gray-600">
                    Working Type: {freelancer.doctorDetails ? freelancer.doctorDetails.workingType : 'N/A'}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">No items in the cart.</p>
      )}

      <div className="text-center mt-6">
        <button className="bg-green-500 px-6 py-2 rounded-lg text-white hover:bg-green-700">
          Confirm and Pay
        </button>
      </div>
    </div>
  );
};

export default Checkout;
