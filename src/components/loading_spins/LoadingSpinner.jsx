
import loadingGif from "../../assets/image/loading.gif"; 

export default function LoadingSpinner({ size = 100}) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <img
        src={loadingGif}
        alt="Loading..."
        style={{
          width: size,
          height: size,
          objectFit: "contain",
        }}
      />
    </div>
  );
}
