import React from 'react';

// 페이지 이동 및 현재 경로 확인
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';

// MUI 레이아웃 컴포넌트
import { Box, CssBaseline } from '@mui/material';

// 화면 컴포넌트
import Main from './components/Main';
import Sub from './components/Sub';
import Menu from './components/Menu';

// 로그인 / 회원가입 페이지
import Login from './pages/Login';
import Join from './pages/Join';

//마이페이지
import MyPage from './pages/MyPage';
//피드작성페이지
import Write from './pages/Write';
// 피드목록페이지
import Feed from './pages/Feed';
// 게시글상세보기
import PostView from './pages/PostView';
import TeamBoard from "./pages/TeamBoard";

function App() {

  // 현재 URL 경로 정보
  const location = useLocation();

  // 로그인, 회원가입 페이지 여부 확인
  const isAuthPage =
    location.pathname === '/' ||
    location.pathname === '/join';

  // 로그인 시 저장한 JWT 토큰 가져오기
  const token = localStorage.getItem("token");

  return (
    <Box sx={{ display: 'flex' }}>

      {/* MUI 기본 CSS 적용 */}
      <CssBaseline />

      {/* 로그인/회원가입 페이지가 아닐 때만 메뉴 출력 */}
      {!isAuthPage && <Menu />}

      {/* 본문 영역 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0
        }}
      >

        <Routes>

          {/* 로그인 페이지 */}
          <Route
            path="/"
            element={<Login />}
          />

          {/* 회원가입 페이지 */}
          <Route
            path="/join"
            element={<Join />}
          />

          {/* 메인 페이지
              토큰이 있으면 Main 출력
              없으면 로그인 페이지로 이동
          */}
          <Route
            path="/main"
            element={
              token
                ? <Main />
                : <Navigate to="/" />
            }
          />

          <Route path="/team/:teamId" element={<TeamBoard />} />

          {/* 서브 페이지
              토큰이 있으면 Sub 출력
              없으면 로그인 페이지로 이동
          */}
          <Route
            path="/sub"
            element={
              token
                ? <Sub />
                : <Navigate to="/" />
            }
          />
          {/* 마이페이지 */}
          <Route
            path="/mypage"
            element={token ? <MyPage /> : <Navigate to="/" />}
          />

          <Route
            path="/write"
            element={token ? <Write /> : <Navigate to="/" />}
          />
          {/* 피드목록 */}
          <Route
            path="/feed"
            element={
              token
                ? <Feed />
                : <Navigate to="/" />
            }

          />
          {/* 게시글상세보기 */}
          <Route
            path="/post/:postId"
            element={token ? <PostView /> : <Navigate to="/" />}
          />



        </Routes>

      </Box>

    </Box>
  );
}

export default App;