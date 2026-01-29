import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, ThemeProvider } from '@/context';
import { Layout } from '@/components';
import { Dashboard, Users, Settings, Login, NotFound } from '@/pages';

function App(): React.ReactNode {
  return (
    <ThemeProvider defaultTheme="system" storageKey="admin-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
