import { QuestionIcon } from '@phosphor-icons/react/ssr';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <QuestionIcon size={64} className="text-text-disabled mb-6" />
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        ページが見つかりません
      </h1>
      <p className="text-sm text-text-secondary mb-6">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Link
        href="/"
        className="bg-accent text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors"
      >
        ホームに戻る
      </Link>
    </div>
  );
}
