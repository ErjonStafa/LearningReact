import Home from "./components/Home";
import PostPage from "./components/PostPage";
import NewPost from "./components/NewPost";
import About from "./components/About";
import Missing from "./components/Missing";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import { format } from "date-fns";
import EditPost from "./components/EditPost";
import useWindowSize from "./hooks/useWindowSize";
import useAxiosFetch from "./hooks/useAxiosFetch";
import api from "./api/posts";
import { DataProvider } from "./context/DataContext";

const App = () => {
  const { width } = useWindowSize();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [posts, setPosts] = useState([]);
  const { data, fetchError, isLoading } = useAxiosFetch(
    "http://localhost:3500/posts"
  );

  const navigate = useNavigate();

  useEffect(() => {
    setPosts(data);
  }, [data]);

  useEffect(() => {
    const filteredResults = posts.filter(
      (post) =>
        post.body.toLowerCase().includes(search.toLowerCase()) ||
        post.title.toLowerCase().includes(search.toLowerCase())
    );
    setSearchResults(filteredResults.reverse());
  }, [posts, search]);

  const handleEdit = async (id) => {
    const datetime = format(new Date(), "MMMM dd, yyyy pp");
    const post = {
      id: id,
      title: editTitle,
      datetime: datetime,
      body: editBody,
    };
    try {
      const response = await api.put("/posts/" + id, post);

      setPosts(
        posts.map((post) => (post.id === id ? { ...response.data } : post))
      );
      setEditTitle("");
      setEditBody("");
      navigate("/");
    } catch (error) {
      console.log("Error" + error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete("/posts/" + id);
      const allPosts = posts.filter((post) => post.id !== id);
      setPosts(allPosts);
      navigate("/");
    } catch (error) {
      console.log("Error" + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = posts.length ? posts[posts.length - 1].id + 1 : 1;
    const datetime = format(new Date(), "MMMM dd, yyyy pp");
    const post = {
      id: id,
      title: postTitle,
      datetime: datetime,
      body: postBody,
    };

    try {
      const response = await api.post("/posts", post);
      const AllPosts = [...posts, response.data];
      setPosts(AllPosts);
      setPostTitle("");
      setPostBody("");
      navigate("/");
    } catch (error) {
      console.log("Error" + error.message);
    }
  };

  return (
    <DataProvider>
      <Routes>
        <Route
          path="/"
          element={
            <Layout search={search} width={width} setSearch={setSearch} />
          }
        >
          <Route
            index
            element={
              <Home
                fetchError={fetchError}
                isLoading={isLoading}
                posts={searchResults}
              />
            }
          />
          <Route path="post">
            <Route
              index
              element={
                <NewPost
                  handleSubmit={handleSubmit}
                  postTitle={postTitle}
                  setPostTitle={setPostTitle}
                  postBody={postBody}
                  setPostBody={setPostBody}
                />
              }
            />
            <Route
              path=":id"
              element={<PostPage posts={posts} handleDelete={handleDelete} />}
            />
          </Route>
          <Route
            path="/edit/:id"
            element={
              <EditPost
                posts={posts}
                handleEdit={handleEdit}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                editBody={editBody}
                setEditBody={setEditBody}
              />
            }
          />
          <Route path="about" element={<About />} />
          <Route path="*" element={<Missing />} />
        </Route>
      </Routes>
    </DataProvider>
  );
};

export default App;
