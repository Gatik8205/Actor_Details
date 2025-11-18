// app/page.tsx

export default function Home() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-4xl font-bold">IMDb Clone</h1>
      <p className="text-gray-400 mt-4">
        Search actors and explore full filmography.
      </p>

      <p className="mt-6 text-gray-300">
        Try an example actor:
      </p>

      <a
        href="/actors/500"
        className="
          inline-block mt-4 px-6 py-3 
          bg-yellow-500 text-black font-semibold 
          rounded-lg hover:bg-yellow-600 transition
        "
      >
        View Tom Cruise. (ID: 500)
      </a>
    </div>
  );
}
