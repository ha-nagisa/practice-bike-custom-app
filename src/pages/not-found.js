import { useEffect } from 'react';
import Header from '../components/header';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Not Found - Bun Bun BIKE';
  }, []);

  return (
    <div className="bg-gray-background">
      <Header />
      <div className="mx-auto max-w-screen-lg mt-20">
        <p className="text-center text-xl">該当のページが見つかりません。</p>
      </div>
    </div>
  );
}
