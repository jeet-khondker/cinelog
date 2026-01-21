import { useState, useEffect } from "react";
import {
  Container,
  SimpleGrid,
  Card,
  Image,
  Text,
  Group,
  ActionIcon,
  Title,
  Loader,
  Center,
  Modal,
  Badge,
  Stack,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IoTrashOutline } from "react-icons/io5";
import { notifications } from "@mantine/notifications";
import api from "../api/axios";

interface Favorite {
  id: string;
  imdbID: string;
  title: string;
  poster: string;
}

interface MovieDetail {
  Title: string;
  Poster: string;
  Plot: string;
  Director: string;
  Actors: string;
  Genre: string;
  Runtime: string;
  imdbRating: string;
}

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  // モーダル管理
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchFavorites = async () => {
    try {
      const response = await api.get("/favorites");
      setFavorites(response.data);
    } catch (error) {
      console.error("お気に入りの取得に失敗しました", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // 詳細取得
  const handleOpenDetail = async (imdbID: string) => {
    setDetailLoading(true);
    open();
    try {
      const response = await api.get(`/movies/detail?id=${imdbID}`);
      setSelectedMovie(response.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      notifications.show({
        title: "エラー",
        message: "詳細の取得に失敗しました",
        color: "red",
      });
      close();
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (imdbID: string) => {
    try {
      await api.delete(`/favorites?imdbID=${imdbID}`);
      setFavorites((prev) => prev.filter((fav) => fav.imdbID !== imdbID));
      notifications.show({
        title: "削除完了",
        message: "お気に入りから削除しました",
        color: "gray",
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      notifications.show({
        title: "エラー",
        message: "削除に失敗しました",
        color: "red",
      });
    }
  };

  if (loading)
    return (
      <Center h="80vh">
        <Loader size="xl" />
      </Center>
    );

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xl">
        お気に入り一覧
      </Title>

      {/* 詳細モーダル (Home.tsx とほぼ同じ) */}
      <Modal
        opened={opened}
        onClose={() => {
          close();
          setSelectedMovie(null);
        }}
        title={<Text fw={700}>{selectedMovie?.Title || "読み込み中..."}</Text>}
        size="lg"
        centered
      >
        {detailLoading ? (
          <Center h={200}>
            <Loader color="red" />
          </Center>
        ) : (
          selectedMovie && (
            <Group align="flex-start" wrap="nowrap">
              <Image src={selectedMovie.Poster} w={200} radius="md" />
              <Stack gap="xs">
                <Group gap="xs">
                  <Badge color="blue">{selectedMovie.Genre}</Badge>
                  <Badge color="pink">{selectedMovie.Runtime}</Badge>
                  <Badge color="yellow">★ {selectedMovie.imdbRating}</Badge>
                </Group>
                <Text size="sm" fw={700}>
                  監督:{" "}
                  <Text component="span" fw={400}>
                    {selectedMovie.Director}
                  </Text>
                </Text>
                <Text size="sm" fw={700}>
                  キャスト:{" "}
                  <Text component="span" fw={400}>
                    {selectedMovie.Actors}
                  </Text>
                </Text>
                <Divider my="sm" />
                <Text size="sm" fw={700}>
                  あらすじ
                </Text>
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                  {selectedMovie.Plot}
                </Text>
              </Stack>
            </Group>
          )
        )}
      </Modal>

      {favorites.length === 0 ? (
        <Text c="dimmed">お気に入りに映画はまだ登録されていません。</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {favorites.map((fav) => (
            <Card key={fav.id} shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section
                style={{ cursor: "pointer" }}
                onClick={() => handleOpenDetail(fav.imdbID)}
              >
                <Image src={fav.poster} height={320} alt={fav.title} />
              </Card.Section>

              <Group justify="space-between" mt="md">
                <Text
                  fw={500}
                  lineClamp={1}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleOpenDetail(fav.imdbID)}
                >
                  {fav.title}
                </Text>
                <ActionIcon
                  variant="light"
                  color="red"
                  onClick={() => handleDelete(fav.imdbID)}
                >
                  <IoTrashOutline size={20} />
                </ActionIcon>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
