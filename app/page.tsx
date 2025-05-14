import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 to-gray-900">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-6xl font-bold text-purple-200 mb-4">dreamon</h1>
      </div>
    </main>
  );
}
