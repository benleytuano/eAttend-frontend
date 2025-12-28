export function Loader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-gray-300 border-t-teal-700 rounded-full animate-spin`}
    ></div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <Loader size="lg" />
      </div>
    </div>
  );
}
