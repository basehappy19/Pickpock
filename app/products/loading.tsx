export default function Loading() {
  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <div className="h-10 w-48 bg-muted rounded-xl animate-pulse"></div>
        <div className="h-6 w-96 bg-muted rounded-lg animate-pulse"></div>
      </div>

      <div className="flex gap-4">
        <div className="h-14 flex-1 bg-muted rounded-[2rem] animate-pulse"></div>
        <div className="h-14 w-48 bg-muted rounded-[2rem] animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card rounded-[2.5rem] border overflow-hidden p-8 space-y-4">
            <div className="aspect-[4/3] -mx-8 -mt-8 mb-8 bg-muted animate-pulse"></div>
            <div className="h-6 w-3/4 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-4 w-full bg-muted rounded-md animate-pulse"></div>
            <div className="h-4 w-2/3 bg-muted rounded-md animate-pulse"></div>
            <div className="pt-4 flex justify-between items-center border-t border-muted mt-4">
              <div className="h-8 w-24 bg-muted rounded-lg animate-pulse"></div>
              <div className="h-10 w-10 bg-muted rounded-xl animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
