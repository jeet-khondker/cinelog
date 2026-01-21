import { useState, useEffect } from "react";
import {
  Container,
  TextInput,
  Button,
  Group,
  SimpleGrid,
  Card,
  Image,
  Text,
  ActionIcon,
  Modal,
  Loader,
  Stack,
  Badge,
  Divider,
  Center,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IoSearchOutline,
  IoHeartOutline,
  IoHeart,
  IoAlertCircle,
  IoCheckmarkCircle,
} from "react-icons/io5";
import api from "../api/axios";
import axios from "axios";
import { notifications } from "@mantine/notifications";

interface Movie {
  imdbID: string;
  Title: string;
  Poster: string;
  Year: string;
}

interface Favorite {
  imdbID: string;
}

interface MovieDetail extends Movie {
  Plot: string;
  Director: string;
  Actors: string;
  Genre: string;
  Runtime: string;
  imdbRating: string;
}

export function HomePage() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // 追加ステート
  const [page, setPage] = useState(1); // 現在のページ
  const [totalResults, setTotalResults] = useState(0); // 全体の件数
  const [searchLoading, setSearchLoading] = useState(false); // 検索ボタン用
  const [moreLoading, setMoreLoading] = useState(false); // もっと見る用

  // モーダル用
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await api.get("/favorites");
        const data = response.data as Favorite[];
        const ids = new Set(data.map((fav) => fav.imdbID));
        setFavoriteIds(ids);
      } catch (error) {
        console.error("お気に入りの取得に失敗しました", error);
      }
    };
    fetchFavorites();
  }, []);

  // 検索
  const handleSearch = async () => {
    if (!query) return;
    setSearchLoading(true);
    setPage(1); // ページをリセット
    try {
      const response = await api.get(`/movies/search?title=${query}&page=1`);
      setMovies(response.data.Search || []);
      setTotalResults(Number(response.data.totalResults) || 0);
    } catch (error) {
      console.error("検索に失敗しました", error);
    } finally {
      setSearchLoading(false);
    }
  };

  // 読み込み
  const handleLoadMore = async () => {
    setMoreLoading(true);
    const nextPage = page + 1;
    try {
      const response = await api.get(
        `/movies/search?title=${query}&page=${nextPage}`,
      );
      if (response.data.Search) {
        setMovies((prev) => [...prev, ...response.data.Search]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("さらに読み込むことができませんでした", error);
    } finally {
      setMoreLoading(false);
    }
  };

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
        message: "映画詳細の取得に失敗しました。",
        color: "red",
      });
      close();
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddFavorite = async (movie: Movie) => {
    if (favoriteIds.has(movie.imdbID)) return;
    try {
      await api.post("/favorites", {
        imdbID: movie.imdbID,
        title: movie.Title,
        poster: movie.Poster,
      });
      setFavoriteIds((prev) => new Set(prev).add(movie.imdbID));
      notifications.show({
        title: "追加済",
        message: `${movie.Title} をお気に入りに追加しました。`,
        color: "green",
        icon: <IoCheckmarkCircle size={18} />,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          setFavoriteIds((prev) => new Set(prev).add(movie.imdbID));
          notifications.show({
            title: "すでに追加済み",
            message: "この映画は既にお気に入りに入っています。",
            color: "yellow",
          });
        } else {
          notifications.show({
            title: "Error",
            message: "お気に入り登録に失敗しました。",
            color: "red",
            icon: <IoAlertCircle size={18} />,
          });
        }
      }
    }
  };

  return (
    <Container size="lg" py="xl">
      {/* モーダルの中身は変更なし */}
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
              <Image
                src={
                  selectedMovie.Poster !== "N/A"
                    ? selectedMovie.Poster
                    : "https://placehold.co/200x300?text=No+Poster"
                }
                w={200}
                radius="md"
              />
              <Stack gap="xs">
                <Group gap="xs">
                  <Badge color="blue">{selectedMovie.Genre}</Badge>
                  <Badge color="pink">{selectedMovie.Runtime}</Badge>
                  <Badge color="yellow">★ {selectedMovie.imdbRating}</Badge>
                </Group>
                <Text size="sm" fw={700} mt="sm">
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

      <Group mb="xl">
        <TextInput
          placeholder="動画タイトルで検索"
          style={{ flex: 1 }}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()} // エンターキー対応
        />
        <Button
          onClick={handleSearch}
          leftSection={<IoSearchOutline />}
          loading={searchLoading} // 検索中にLoadingを表示
        >
          検索
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        {movies.map((movie) => {
          const isFavorited = favoriteIds.has(movie.imdbID);
          return (
            <Card
              key={movie.imdbID}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              className="movie-card-hover"
            >
              <Card.Section
                style={{ cursor: "pointer" }}
                onClick={() => handleOpenDetail(movie.imdbID)}
              >
                <Image
                  src={
                    movie.Poster !== "N/A"
                      ? movie.Poster
                      : "https://placehold.co/300x450?text=No+Poster"
                  }
                  height={320}
                  alt={movie.Title}
                />
              </Card.Section>

              <Group justify="space-between" mt="md" mb="xs">
                <Text
                  fw={500}
                  lineClamp={1}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleOpenDetail(movie.imdbID)}
                >
                  {movie.Title}
                </Text>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => handleAddFavorite(movie)}
                  disabled={isFavorited}
                >
                  {isFavorited ? (
                    <IoHeart size={24} />
                  ) : (
                    <IoHeartOutline size={24} />
                  )}
                </ActionIcon>
              </Group>
              <Text size="sm" c="dimmed">
                {movie.Year}
              </Text>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* 「もっと見る」ボタン：現在のリスト件数が全件数より少ない場合に表示 */}
      {movies.length > 0 && movies.length < totalResults && (
        <Center mt="xl">
          <Button
            variant="light"
            color="gray"
            onClick={handleLoadMore}
            loading={moreLoading}
          >
            もっと見る
          </Button>
        </Center>
      )}
    </Container>
  );
}
