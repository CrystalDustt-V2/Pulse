import Sidebar from '../components/Sidebar';
import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <MyApp Component={Component} pageProps={pageProps} />
    </AuthProvider>
  )
}

function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar />
      <main className="flex-1 md:ml-56 p-4">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
