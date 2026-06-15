import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";

function Banner() {
  const banners = [
    {
      title: "⚾ KBO 경기 티켓 예매 오픈",
      desc: "응원팀 경기 일정을 확인하고 바로 예매하세요!",
      button: "티켓 예매하기",
      url: "https://www.ticketlink.co.kr"
    },
    {
      title: "🔥 인기 경기 예매 이벤트",
      desc: "LG vs 두산, KIA vs 롯데 등 인기 경기 티켓 확인!",
      button: "예매 사이트 이동",
      url: "https://tickets.interpark.com"
    },
    {
      title: "🎁 야구 팬 특별 프로모션",
      desc: "SpoTalk에서 경기 정보 확인하고 예매까지 한 번에!",
      button: "지금 확인하기",
      url: "https://www.ticketlink.co.kr"
    }
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const banner = banners[index];

  return (
    <Paper
      elevation={3}
      sx={{
        width: "100%",
        height: "220px",
        borderRadius: "18px",
        overflow: "hidden",
        mb: 3,
        background: "linear-gradient(135deg, #1e3c72, #2a5298)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 5
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {banner.title}
        </Typography>

        <Typography variant="h6" sx={{ mb: 3 }}>
          {banner.desc}
        </Typography>

        <Button
          variant="contained"
          color="warning"
          onClick={() => window.open(banner.url, "_blank")}
          sx={{
            fontWeight: "bold",
            borderRadius: "20px",
            px: 3
          }}
        >
          {banner.button}
        </Button>
      </Box>

      <Box
        sx={{
          fontSize: "70px",
          display: { xs: "none", md: "block" }
        }}
      >
        🎟️
      </Box>
    </Paper>
  );
}

export default Banner;