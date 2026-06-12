import React, { useEffect, useState } from "react";

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
import { jwtDecode } from "jwt-decode";

function Menu() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const [openTeamMenu, setOpenTeamMenu] = useState(false);
    const [notiCount, setNotiCount] = useState(0);

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

    function fnGetNotiCount() {
        const currentToken = localStorage.getItem("token");

        if (!currentToken) {
            setNotiCount(0);
            return;
        }

        fetch("http://192.168.30.76.3010/notification/count", {
            headers: {
                Authorization: "Bearer " + currentToken
            }
        })
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    setNotiCount(0);
                    return null;
                }

                return res.json();
            })
            .then(data => {
                if (!data) return;

                if (data.success) {
                    setNotiCount(data.count || 0);
                }
            })
            .catch(err => console.log(err));
    }

    function fnLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        alert("로그아웃 되었습니다.");
        navigate("/");
    }

    useEffect(() => {
        fnGetNotiCount();

        const timer = setInterval(() => {
            fnGetNotiCount();
        }, 10000);

        return () => clearInterval(timer);
    }, []);

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

            <Box sx={{ px: 2, py: 2, borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#ffffff" }}>
                    SpoTalk
                </Typography>

                <Typography sx={{ mt: 1, fontSize: "13px", color: "#b0bec5" }}>
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
                    src={user?.PROFILE_IMG ? "http://192.168.30.76.3010" + user.PROFILE_IMG : ""}
                    sx={{ width: 42, height: 42, bgcolor: "#1976d2" }}
                />

                <Box>
                    <Typography sx={{ fontSize: "14px", color: "#cfd8dc", fontWeight: "bold" }}>
                        {user?.NICKNAME || user?.nickname || user?.ADMIN_NAME || "게스트"}
                    </Typography>

                    <Typography sx={{ fontSize: "11px", color: "#90a4ae", mt: 0.3 }}>
                        {loginUser?.role === "ADMIN" ? "관리자 계정" : "환영합니다."}
                    </Typography>
                </Box>
            </Box>

            <List sx={{ px: 1, mt: 1 }}>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/main" sx={menuStyle}>
                        <ListItemIcon sx={iconStyle}>
                            <Home />
                        </ListItemIcon>
                        <ListItemText primary="메인" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton
                        component={Link}
                        to="/notification"
                        sx={menuStyle}
                        onClick={fnGetNotiCount}
                    >
                        <ListItemIcon sx={iconStyle}>🔔</ListItemIcon>

                        <ListItemText
                            primary={
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}
                                >
                                    <span>알림</span>

                                    {notiCount > 0 && (
                                        <span
                                            style={{
                                                backgroundColor: "#f44336",
                                                color: "white",
                                                borderRadius: "999px",
                                                padding: "2px 7px",
                                                fontSize: "11px",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            {notiCount}
                                        </span>
                                    )}
                                </Box>
                            }
                        />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/ranking" sx={menuStyle}>
                        <ListItemIcon sx={iconStyle}>🏆</ListItemIcon>
                        <ListItemText primary="팬랭킹" />
                    </ListItemButton>
                </ListItem>

                {loginUser?.role !== "ADMIN" && (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/write" sx={menuStyle}>
                                <ListItemIcon sx={iconStyle}>
                                    <EditNote />
                                </ListItemIcon>
                                <ListItemText primary="글쓰기" />
                            </ListItemButton>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/feed" sx={menuStyle}>
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

                        {openTeamMenu &&
                            teams.map(team => (
                                <ListItem key={team.id} disablePadding>
                                    <ListItemButton
                                        component={Link}
                                        to={"/team/" + team.id}
                                        sx={{ ...menuStyle, pl: 6, fontSize: "13px" }}
                                    >
                                        <ListItemText primary={team.name} />
                                    </ListItemButton>
                                </ListItem>
                            ))}

                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/mypage" sx={menuStyle}>
                                <ListItemIcon sx={iconStyle}>
                                    <Person />
                                </ListItemIcon>
                                <ListItemText primary="마이페이지" />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}

                {loginUser?.role === "ADMIN" && (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/admin/dashboard" sx={menuStyle}>
                                <ListItemIcon sx={iconStyle}>📊</ListItemIcon>
                                <ListItemText primary="대시보드" />
                            </ListItemButton>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/admin/report" sx={menuStyle}>
                                <ListItemIcon sx={iconStyle}>🚨</ListItemIcon>
                                <ListItemText primary="신고관리" />
                            </ListItemButton>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/admin/post" sx={menuStyle}>
                                <ListItemIcon sx={iconStyle}>📝</ListItemIcon>
                                <ListItemText primary="게시글관리" />
                            </ListItemButton>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/admin/user" sx={menuStyle}>
                                <ListItemIcon sx={iconStyle}>👤</ListItemIcon>
                                <ListItemText primary="회원관리" />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}
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