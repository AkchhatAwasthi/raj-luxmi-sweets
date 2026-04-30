export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FFFDF7]/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#E6D5B8] border-t-[#8B2131] rounded-full animate-spin"></div>
        <p className="text-[#8B2131] font-orange-avenue font-normal tracking-[0.2em] uppercase text-sm animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
