export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 animate-pulse">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="h-8 w-32 bg-surface-light rounded mx-auto" />
          <div className="h-4 w-48 bg-surface-light rounded mx-auto" />
        </div>
        <div className="space-y-4">
          <div className="h-12 bg-surface-light rounded-lg" />
          <div className="h-12 bg-surface-light rounded-lg" />
          <div className="h-12 bg-accent/20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
