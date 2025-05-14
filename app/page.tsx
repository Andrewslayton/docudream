import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">dreamon</h1>
      </div>
    </main>
  );
}
