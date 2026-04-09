import { BrowserRouter } from 'react-router-dom';
import { Providers } from './app/providers';
import ThemeSync from './app/ThemeSync';
import AppRoutes from './routes';

export default function App() {
  return (
    <Providers>
      <ThemeSync />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Providers>
  );
}
