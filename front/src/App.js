import React from 'react';

import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { jwtDecode } from "jwt-decode";

import Main from './components/Main';
import Sub from './components/Sub';
import Menu from './components/Menu';

import Login from './pages/Login';
import Join from './pages/Join';
import FindId from './pages/FindId';
import ResetPassword from './pages/ResetPassword';

import MyPage from './pages/MyPage';
import Write from './pages/Write';
import Feed from './pages/Feed';
import PostView from './pages/PostView';
import TeamBoard from "./pages/TeamBoard";
import AdminReport from './pages/AdminReport';
import AdminPost from './pages/AdminPost';
import AdminUser from './pages/AdminUser';




function App() {
  const location = useLocation();

  const isAuthPage =
    location.pathname === '/' ||
    location.pathname === '/join' ||
    location.pathname === '/find-id' ||
    location.pathname === '/reset-password';

  const token = localStorage.getItem("token");

  let loginUser = null;

  if (token) {
    try {
      loginUser = jwtDecode(token);
    } catch (err) {
      console.log("토큰 디코드 실패", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {!isAuthPage && <Menu />}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0
        }}
      >
        <Routes>
          <Route path="/" element={<Login />} />

          <Route path="/join" element={<Join />} />

          <Route path="/find-id" element={<FindId />} />

          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/main"
            element={token ? <Main /> : <Navigate to="/" />}
          />

          <Route
            path="/team/:teamId"
            element={token ? <TeamBoard /> : <Navigate to="/" />}
          />

          <Route
            path="/sub"
            element={token ? <Sub /> : <Navigate to="/" />}
          />

          <Route
            path="/mypage"
            element={token ? <MyPage /> : <Navigate to="/" />}
          />

          <Route
            path="/write"
            element={token ? <Write /> : <Navigate to="/" />}
          />

          <Route
            path="/feed"
            element={token ? <Feed /> : <Navigate to="/" />}
          />

          <Route
            path="/post/:postId"
            element={token ? <PostView /> : <Navigate to="/" />}
          />

          <Route
            path="/admin/report"
            element={
              loginUser?.role === "ADMIN"
                ? <AdminReport />
                : <Navigate to="/main" />
            }
          />
          <Route
            path="/admin/post"
            element={
              loginUser?.role === "ADMIN"
                ? <AdminPost />
                : <Navigate to="/main" />
            }
          />

          <Route
            path="/admin/user"
            element={
              loginUser?.role === "ADMIN"
                ? <AdminUser />
                : <Navigate to="/main" />
            }
          />

        </Routes>
      </Box>
    </Box>
  );
}

export default App;