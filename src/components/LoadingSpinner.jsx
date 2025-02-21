/* eslint-disable react/prop-types */
import { PuffLoader } from "react-spinners";

const LoadingSpinner = ({ loading = true, size = 50, color = "#3498db" }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <PuffLoader color={color} loading={loading} size={size} />
    </div>
  );
};

export default LoadingSpinner;
