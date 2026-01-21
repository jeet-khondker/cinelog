import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Group, Button, Title } from "@mantine/core";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { FavoritesPage } from "./pages/Favorites";
import { useAuthStore } from "./store/useAuthStore";

export default function App() {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  return (
    <BrowserRouter>
      {/* ログイン中のみヘッダーを表示 */}
      {token && (
        <Group
          justify="space-between"
          p="md"
          style={{ borderBottom: "1px solid #373A40" }}
        >
          <Title order={3} c="red.6">
            シネログ
          </Title>
          <Group>
            <Button variant="subtle" component={Link} to="/">
              検索
            </Button>
            <Button variant="subtle" component={Link} to="/favorites">
              お気に入り
            </Button>
            <Button variant="outline" color="gray" size="xs" onClick={logout}>
              ログアウト
            </Button>
          </Group>
        </Group>
      )}

      <Routes>
        <Route
          path="/login"
          element={!token ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={token ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/favorites"
          element={token ? <FavoritesPage /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
