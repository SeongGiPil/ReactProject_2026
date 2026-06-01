const express = require("express"); // Express 서버 프레임워크
const cors = require("cors"); // React와 통신하기 위한 CORS 설정
const db = require("./db"); // Oracle DB 연결 모듈
const path = require("path");

// 회원 관련 API 라우터
const userRouter = require("./routes/user");

// 게시글 관련 API 라우터
const postRouter = require("./routes/post");

// 팀 관련 API 라우터
const teamRouter = require("./routes/team");

// 댓글 관련 API 라우터
const commentRouter = require("./routes/comment");

// Express 객체 생성
const app = express();

const likeRouter = require("./routes/like");




// =============================
// 미들웨어 설정
// =============================

// React(3000) ↔ Node(3010) 통신 허용
app.use(cors());

// 요청 Body의 JSON 데이터를 사용할 수 있게 설정
// req.body 사용 가능
app.use(express.json());

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);


// =============================
// Router 연결
// =============================

// 회원 API
// 예)
// POST /user/login
// POST /user/join
// GET /user/:userId
app.use("/user", userRouter);

// 게시글 API
// 예)
// GET /post
// POST /post/add
// PUT /post/:postId
// DELETE /post/:postId
app.use("/post", postRouter);

// 팀 API
// 예)
// GET /team
app.use("/team", teamRouter);

// 댓글 API
// 예)
// GET /comment/:postId
// POST /comment
// DELETE /comment/:commentId
app.use("/comment", commentRouter);

app.use("/like", likeRouter);


// =============================
// 기본 URL 테스트
// =============================

// 브라우저에서
// http://localhost:3010
// 접속 시 실행
app.get("/", (req, res) => {
    res.send("SpoTalk Server Start");
});


// =============================
// 서버 실행 함수
// =============================

async function startServer() {

    try {

        // Oracle Connection Pool 생성
        // 서버 시작 시 한 번만 실행
        await db.init();

        // 3010 포트로 서버 실행
        app.listen(3010, () => {
            console.log("Server Start");
            console.log("http://localhost:3010");
        });

    } catch (err) {

        // DB 연결 실패 시 에러 출력
        console.error("DB 연결 실패", err);

    }

}


// =============================
// 서버 시작
// =============================

// startServer 함수 실행
startServer();
