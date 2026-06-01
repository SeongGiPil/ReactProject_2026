import React from 'react';

// MUI 컴포넌트
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  Toolbar,
  ListItemIcon,
  Button
} from '@mui/material';


// 메뉴 아이콘
import {
  Home,      // 메인 아이콘
  Person,    // 마이페이지 아이콘
  EditNote,  // 글쓰기 아이콘
  Article    // 게시글 목록 아이콘
} from '@mui/icons-material';

// 페이지 이동
import { Link, useNavigate } from 'react-router-dom';

function Menu() {

  // 페이지 이동 객체
  const navigate = useNavigate();

  // 로그인한 사용자 정보 가져오기
  const user = JSON.parse(localStorage.getItem("user"));

  // 로그아웃 함수
  function fnLogout() {

    // JWT 토큰 삭제
    localStorage.removeItem("token");

    // 로그인 사용자 정보 삭제
    localStorage.removeItem("user");

    alert("로그아웃 되었습니다.");

    // 로그인 페이지로 이동
    navigate("/");
  }

  return (

    // 왼쪽 사이드 메뉴
    <Drawer
      variant="permanent"
      sx={{
        // 메뉴 너비
        width: 240,

        // 화면 축소 시 메뉴 크기 유지
        flexShrink: 0,

        '& .MuiDrawer-paper': {

          // Drawer 내부 너비
          width: 240,

          // padding 포함 크기 계산
          boxSizing: 'border-box',
        },
      }}
    >

      {/* 상단 여백 */}
      <Toolbar />

      {/* 메뉴 제목 */}
      <Typography
        variant="h6"
        sx={{ p: 2 }}
      >
        SNS 메뉴
      </Typography>

      {/* 로그인 사용자 닉네임 출력 */}
      <Typography
        sx={{
          px: 2,
          pb: 2
        }}
      >
        {user?.NICKNAME || user?.nickname}님 환영합니다.
      </Typography>

      {/* 메뉴 목록 */}
      <List>

        {/* 메인 페이지 이동 */}
        <ListItem
          button
          component={Link}
          to="/main"
        >
          <ListItemIcon>
            <Home />
          </ListItemIcon>

          <ListItemText
            primary="메인"
          />
        </ListItem>

        {/* 글쓰기 페이지 이동 */}
        <ListItem
          button
          component={Link}
          to="/write"
        >
          <ListItemIcon>
            <EditNote />
          </ListItemIcon>

          <ListItemText
            primary="글쓰기"
          />
        </ListItem>
        {/* 게시글목록 */}
        {/* 게시글 목록 페이지 이동 */}
        <ListItem
          button
          component={Link}
          to="/feed"
        >
          <ListItemIcon>

            {/* 게시글 목록 아이콘 */}
            <Article />

          </ListItemIcon>

          {/* 메뉴 이름 */}
          <ListItemText
            primary="게시글목록"
          />

        </ListItem>

        {/* 서브 페이지 이동 */}
        <ListItem
          button
          component={Link}
          to="/sub"
        >
          <ListItemIcon>
            <Home />
          </ListItemIcon>

          <ListItemText
            primary="서브"
          />
        </ListItem>

        {/* 마이페이지 이동 */}
        <ListItem
          button
          component={Link}
          to="/mypage"
        >
          <ListItemIcon>
            <Person />
          </ListItemIcon>

          <ListItemText
            primary="마이페이지"
          />
        </ListItem>

      </List>

      {/* 로그아웃 버튼 */}
      <Button
        variant="contained"
        color="error"
        sx={{
          margin: 2
        }}
        onClick={fnLogout}
      >
        로그아웃
      </Button>

    </Drawer>
  );
}


export default Menu;