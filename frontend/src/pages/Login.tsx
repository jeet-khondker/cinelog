import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../store/useAuthStore";
import { notifications } from "@mantine/notifications"; // 追加
import { IoCheckmarkCircle, IoAlertCircle } from "react-icons/io5"; // アイコン追加

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Loading状態を追加
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true); // 通信開始時にLoadingをオン
    try {
      const response = await api.post("/auth/login", { email, password });
      setAuth(response.data.user, response.data.access_token);

      // 成功通知
      notifications.show({
        title: "ログイン成功",
        message: "おかえりなさい！シネログへようこそ。",
        color: "teal",
        icon: <IoCheckmarkCircle size={18} />,
      });

      navigate("/");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // エラー通知
      notifications.show({
        title: "ログイン失敗",
        message: "メールアドレスまたはパスワードが正しくありません。",
        color: "red",
        icon: <IoAlertCircle size={18} />,
      });
    } finally {
      setLoading(false); // 通信終了時にLoadingをオフ
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        background:
          'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1500&q=80")',
        backgroundSize: "cover",
      }}
    >
      <Container size={420} my={40}>
        <Title ta="center" c="white">
          シネログへようこそ！
        </Title>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <TextInput
            label="メールアドレス"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <PasswordInput
            label="パスワード"
            placeholder="abc12345"
            required
            mt="md"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
          <Button
            fullWidth
            mt="xl"
            onClick={handleSubmit}
            loading={loading} // 検索ボタンと同様にLoading表示を追加
          >
            ログイン
          </Button>
        </Paper>
      </Container>
    </div>
  );
}
