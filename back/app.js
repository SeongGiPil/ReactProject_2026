const express = require("express");
const cors = require("cors");
const db = require("./db");
const path = require("path");

// 라우터 import
const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
const teamRouter = require("./routes/team");
const commentRouter = require("./routes/comment");
const likeRouter = require("./routes/like");
const reportRouter = require("./routes/report");

const adminRouter = require("./routes/admin");

const attendanceRouter = require("./routes/attendance");

const notificationRouter = require("./routes/notification");

const followRouter = require("./routes/follow");


const bannerRouter = require("./routes/banner");

// Express 객체 생성
const app = express();

// =============================
// 미들웨어 설정
// =============================

// React와 Node 서버 통신 허용
app.use(cors());

// JSON body 사용 가능하게 설정
app.use(express.json());

// 업로드 이미지 접근 경로 설정
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// =============================
// Router 연결
// =============================

app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/team", teamRouter);
app.use("/comment", commentRouter);
app.use("/like", likeRouter);
app.use("/report", reportRouter);

app.use("/admin", adminRouter);
app.use("/attendance", attendanceRouter);

app.use("/notification", notificationRouter);

app.use("/follow", followRouter);

app.use("/banner", bannerRouter);

// =============================
// 기본 URL 테스트
// =============================

app.get("/", (req, res) => {
    res.send("SpoTalk Server Start");
});

// =============================
// 서버 실행
// =============================

async function startServer() {
    try {
        await db.init();

        app.listen(3010, () => {
            console.log("=================================");
            console.log("SpoTalk Server Start");
            console.log("http://192.168.30.76.3010");
            console.log("=================================");
        });

    } catch (err) {
        console.error("DB 연결 실패", err);
    }
}

startServer();