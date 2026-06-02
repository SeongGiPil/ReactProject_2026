import React, { useState } from "react";

import {
    Drawer,
    List,
    ListItem,
    ListItemText,
    Typography,
    Toolbar,
    ListItemIcon,
    Button,
    Box,
    ListItemButton,
    Avatar
} from "@mui/material";

import {
    Home,
    Person,
    EditNote,
    Article,
    Logout,
    Groups
} from "@mui/icons-material";

import { Link, useNavigate } from "react-router-dom";

function Menu() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    // =========================
    // 팀 게시판 드롭다운 여부
    // true = 펼침
    // false = 닫힘
    // =========================
    const [openTeamMenu, setOpenTeamMenu] = useState(false);

    // =========================
    // 팀 목록
    // =========================
    const teams = [
        { id: 1, name: "LG" },
        { id: 2, name: "두산" },
        { id: 3, name: "SSG" },
        { id: 4, name: "KIA" },
        { id: 5, name: "삼성" },
        { id: 6, name: "롯데" },
        { id: 7, name: "한화" },
        { id: 8, name: "KT" },
        { id: 9, name: "NC" },
        { id: 10, name: "키움" }
    ];



    function fnLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        alert("로그아웃 되었습니다.");
        navigate("/");
    }

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 200,
                flexShrink: 0,

                "& .MuiDrawer-paper": {
                    width: 200,
                    boxSizing: "border-box",
                    backgroundColor: "#102030",
                    color: "white",
                    borderRight: "none"
                }
            }}
        >
            <Toolbar />

            <Box
                sx={{
                    px: 2,
                    py: 2,
                    borderBottom: "1px solid rgba(255,255,255,0.15)"
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: "bold",
                        color: "#ffffff"
                    }}
                >
                    SpoTalk
                </Typography>

                <Typography
                    sx={{
                        mt: 1,
                        fontSize: "13px",
                        color: "#b0bec5"
                    }}
                >
                    스포츠 팬 커뮤니티
                </Typography>
            </Box>

            <Box
                sx={{
                    px: 2,
                    py: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    borderBottom: "1px solid rgba(255,255,255,0.15)"
                }}
            >
                <Avatar
                    src={
                        user?.PROFILE_IMG
                            ? "http://localhost:3010" + user.PROFILE_IMG
                            : ""
                    }
                    sx={{
                        width: 42,
                        height: 42,
                        bgcolor: "#1976d2"
                    }}
                />

                <Box>
                    <Typography
                        sx={{
                            fontSize: "14px",
                            color: "#cfd8dc",
                            fontWeight: "bold"
                        }}
                    >
                        {user?.NICKNAME || user?.nickname || "게스트"}
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: "11px",
                            color: "#90a4ae",
                            mt: 0.3
                        }}
                    >
                        환영합니다.
                    </Typography>
                </Box>
            </Box>

            <List sx={{ px: 1, mt: 1 }}>
                <ListItem disablePadding>
                    <ListItemButton
                        component={Link}
                        to="/main"
                        sx={menuStyle}
                    >
                        <ListItemIcon sx={iconStyle}>
                            <Home />
                        </ListItemIcon>
                        <ListItemText primary="메인" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton
                        component={Link}
                        to="/write"
                        sx={menuStyle}
                    >
                        <ListItemIcon sx={iconStyle}>
                            <EditNote />
                        </ListItemIcon>
                        <ListItemText primary="글쓰기" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton
                        component={Link}
                        to="/feed"
                        sx={menuStyle}
                    >
                        <ListItemIcon sx={iconStyle}>
                            <Article />
                        </ListItemIcon>
                        <ListItemText primary="통합게시판" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => setOpenTeamMenu(!openTeamMenu)}
                        sx={menuStyle}
                    >
                        <ListItemIcon sx={iconStyle}>
                            <Groups />
                        </ListItemIcon>
                        <ListItemText primary="팀 게시판" />
                    </ListItemButton>
                </ListItem>

                {openTeamMenu && teams.map(team => (
                    <ListItem key={team.id} disablePadding>
                        <ListItemButton
                            component={Link}
                            to={"/team/" + team.id}
                            sx={{
                                ...menuStyle,
                                pl: 6,
                                fontSize: "13px"
                            }}
                        >
                            <ListItemText primary={team.name} />
                        </ListItemButton>
                    </ListItem>
                ))}


                <ListItem disablePadding>
                    <ListItemButton
                        component={Link}
                        to="/mypage"
                        sx={menuStyle}
                    >
                        <ListItemIcon sx={iconStyle}>
                            <Person />
                        </ListItemIcon>
                        <ListItemText primary="마이페이지" />
                    </ListItemButton>
                </ListItem>
            </List>

            <Box sx={{ mt: "auto", p: 2 }}>
                <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    startIcon={<Logout />}
                    onClick={fnLogout}
                    sx={{
                        height: "40px",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        fontSize: "13px"
                    }}
                >
                    로그아웃
                </Button>
            </Box>
        </Drawer>
    );
}

const menuStyle = {
    borderRadius: "8px",
    mb: 0.5,
    color: "white",

    "&:hover": {
        backgroundColor: "rgba(255,255,255,0.12)"
    }
};

const iconStyle = {
    color: "#90caf9",
    minWidth: "36px"
};

export default Menu;