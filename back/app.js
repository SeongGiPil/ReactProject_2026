const express = require("express"); // Express 서버 사용
const cors = require("cors"); // CORS 허용
const db = require("./db"); // Oracle DB 연결 파일

// 회원 관련 API
const userRouter = require("./routes/user");

// 게시글 관련 API
const postRouter = require("./routes/post");

// Express 객체 생성
const app = express();

const teamRouter = require("./routes/team");

// React(3000) ↔ Node(3010) 통신 허용
app.use(cors());

// JSON 형식 데이터 사용
app.use(express.json());

// 회원 API
// 예) /user/login
// 예) /user/join
app.use("/user", userRouter);

// 게시글 API
// 예) /post/add
app.use("/post", postRouter);

app.use("/team", teamRouter);


// 기본 접속 주소
// http://localhost:3010
app.get("/", (req, res) => {
    res.send("SpoTalk Server Start");
});

// 서버 시작 함수
async function startServer() {

    try {

        // Oracle Connection Pool 생성
        await db.init();

        // 3010 포트로 서버 실행
        app.listen(3010, () => {
            console.log("Server Start");
        });

    } catch (err) {

        // DB 연결 실패
        console.error("DB 연결 실패", err);

    }

}

// 서버 실행
startServer();