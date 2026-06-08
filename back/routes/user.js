// Express 라우터 사용
const express = require("express");

// Oracle DB 결과를 객체 형태로 받기 위해 사용
const oracledb = require("oracledb");

// JWT 토큰 생성용
const jwt = require("jsonwebtoken");

// 비밀번호 암호화 / 비교용
const bcrypt = require("bcrypt");

// 이미지 파일 업로드용
const multer = require("multer");

// 파일 경로 처리용
const path = require("path");

// DB 연결 모듈
const db = require("../db");

const router = express.Router();


// =========================
// 프로필 이미지 업로드 설정
// =========================

const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads/profile"));
    },

    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);

        cb(
            null,
            Date.now() + "_" + Math.round(Math.random() * 1000000) + ext
        );
    }
});

const profileUpload = multer({
    storage: profileStorage
});


// =========================
// 전체 회원 조회
// GET /user
// =========================

router.get("/", async (req, res) => {
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT *
            FROM USERS
            `,
            {},
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        res.json(result.rows);

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "조회 실패"
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 아이디 중복체크
// GET /user/check/:userId
// =========================

router.get("/check/:userId", async (req, res) => {
    const { userId } = req.params;
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT USER_ID
            FROM USERS
            WHERE USER_ID = :userId
            `,
            { userId },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        res.json({
            exists: result.rows.length > 0
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            exists: true,
            message: "중복체크 실패"
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 회원가입
// POST /user/join
// USERS 저장 + USER_TEAM 저장
// =========================

router.post("/join", async (req, res) => {
    const {
        userId,
        pwd,
        nickname,
        email,
        teamList
    } = req.body;

    let conn;

    try {
        conn = await db.getConnection();

        const hashPwd = await bcrypt.hash(pwd, 10);

        await conn.execute(
            `
            INSERT INTO USERS (
                USER_ID,
                USER_PWD,
                NICKNAME,
                EMAIL
            )
            VALUES (
                :userId,
                :pwd,
                :nickname,
                :email
            )
            `,
            {
                userId,
                pwd: hashPwd,
                nickname,
                email
            }
        );

        // 회원가입 시 선택한 응원팀 저장
        const newTeamList = Array.isArray(teamList) ? teamList : [];

        if (newTeamList.length > 0) {
            const uniqueTeamList = [...new Set(newTeamList)];

            for (let i = 0; i < uniqueTeamList.length; i++) {
                await conn.execute(
                    `
                    INSERT INTO USER_TEAM (
                        USER_ID,
                        TEAM_ID,
                        CDATETIME
                    )
                    VALUES (
                        :userId,
                        :teamId,
                        SYSDATE
                    )
                    `,
                    {
                        userId,
                        teamId: Number(uniqueTeamList[i])
                    }
                );
            }
        }

        await conn.commit();

        res.json({
            success: true,
            message: "회원가입 성공"
        });

    } catch (err) {
        console.log("회원가입 에러 :", err);

        if (conn) await conn.rollback();

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 로그인 + JWT 발급
// POST /user/login
// =========================

router.post("/login", async (req, res) => {
    const { userId, pwd } = req.body;
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                USER_ID,
                USER_PWD,
                NICKNAME,
                EMAIL,
                PROFILE_IMG,
                USER_STATUS
            FROM USERS
            WHERE USER_ID = :userId
            `,
            { userId },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        if (result.rows.length === 0) {
            return res.json({
                success: false,
                message: "아이디 또는 비밀번호가 틀렸습니다."
            });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(pwd, user.USER_PWD);

        if (!isMatch) {
            return res.json({
                success: false,
                message: "아이디 또는 비밀번호가 틀렸습니다."
            });
        }

        if (user.USER_STATUS !== "NORMAL") {
            return res.json({
                success: false,
                message: "사용할 수 없는 계정입니다."
            });
        }

        const token = jwt.sign(
            {
                userId: user.USER_ID,
                nickname: user.NICKNAME
            },
            process.env.jwt_key,
            {
                expiresIn: "1h"
            }
        );

        delete user.USER_PWD;

        res.json({
            success: true,
            message: "로그인 성공",
            token,
            user
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: "로그인 실패"
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 마이페이지 통계 조회
// GET /user/stats/:userId
// =========================

router.get("/stats/:userId", async (req, res) => {
    const { userId } = req.params;
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                (SELECT COUNT(*)
                 FROM POST
                 WHERE USER_ID = :userId
                 AND POST_STATUS = 'NORMAL') AS POST_CNT,

                (SELECT COUNT(*)
                 FROM POST_COMMENT
                 WHERE USER_ID = :userId
                 AND COMMENT_STATUS = 'NORMAL') AS COMMENT_CNT,

                (SELECT NVL(SUM(LIKE_CNT), 0)
                 FROM POST
                 WHERE USER_ID = :userId
                 AND POST_STATUS = 'NORMAL') AS TOTAL_LIKE_CNT,
                    (SELECT NVL(SUM(POINT), 0)
                    FROM ATTENDANCE
                     WHERE USER_ID = :userId) AS ATTEND_POINT


            FROM DUAL
            `,
            { userId },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        res.json({
            success: true,
            info: result.rows[0]
        });

    } catch (err) {
        console.log("마이페이지 통계 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 내가 작성한 댓글 목록
// GET /user/my-comments/:userId
// =========================

router.get("/my-comments/:userId", async (req, res) => {
    const { userId } = req.params;
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                C.COMMENT_ID,
                C.POST_ID,
                DBMS_LOB.SUBSTR(C.CONTENT, 4000, 1) AS CONTENT,
                C.CDATETIME,
                P.TITLE
            FROM POST_COMMENT C
            JOIN POST P
                ON C.POST_ID = P.POST_ID
            WHERE C.USER_ID = :userId
            AND C.COMMENT_STATUS = 'NORMAL'
            AND P.POST_STATUS = 'NORMAL'
            ORDER BY C.COMMENT_ID DESC
            `,
            { userId },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        res.json({
            success: true,
            list: result.rows
        });

    } catch (err) {
        console.log("내 댓글 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 내가 좋아요한 게시글
// GET /user/my-likes/:userId
// =========================

router.get("/my-likes/:userId", async (req, res) => {
    const { userId } = req.params;
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                P.POST_ID,
                P.TITLE,
                P.USER_ID,
                NVL(P.LIKE_CNT, 0) AS LIKE_CNT,
                NVL(P.VIEW_CNT, 0) AS VIEW_CNT,
                P.CDATETIME
            FROM POST_LIKE L
            JOIN POST P
                ON L.POST_ID = P.POST_ID
            WHERE L.USER_ID = :userId
            AND P.POST_STATUS = 'NORMAL'
            ORDER BY L.LIKE_ID DESC
            `,
            { userId },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        res.json({
            success: true,
            list: result.rows
        });

    } catch (err) {
        console.log("좋아요 게시글 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 회원정보 수정
// PUT /user/update
// =========================

router.put("/update", async (req, res) => {
    const { userId, nickname, email } = req.body;
    let conn;

    try {
        conn = await db.getConnection();

        await conn.execute(
            `
            UPDATE USERS
            SET
                NICKNAME = :nickname,
                EMAIL = :email
            WHERE USER_ID = :userId
            `,
            {
                userId,
                nickname,
                email
            },
            {
                autoCommit: true
            }
        );

        res.json({
            success: true,
            message: "수정 성공"
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: "수정 실패"
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 프로필 이미지 수정
// POST /user/profile-img
// =========================

router.post(
    "/profile-img",
    profileUpload.single("profileImg"),
    async (req, res) => {
        const { userId } = req.body;
        let conn;

        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "이미지 파일이 없습니다."
                });
            }

            conn = await db.getConnection();

            const profileImgPath = "/uploads/profile/" + req.file.filename;

            await conn.execute(
                `
                UPDATE USERS
                SET PROFILE_IMG = :profileImg
                WHERE USER_ID = :userId
                `,
                {
                    profileImg: profileImgPath,
                    userId
                },
                {
                    autoCommit: true
                }
            );

            res.json({
                success: true,
                message: "프로필 이미지가 변경되었습니다.",
                profileImg: profileImgPath
            });

        } catch (err) {
            console.log("프로필 이미지 업로드 에러 :", err);

            res.status(500).json({
                success: false,
                message: "프로필 이미지 업로드 실패"
            });

        } finally {
            if (conn) await conn.close();
        }
    }
);


// =========================
// 기본 프로필 이미지 선택
// PUT /user/profile-select
// =========================

router.put("/profile-select", async (req, res) => {
    const { userId, profileImg } = req.body;
    let conn;

    try {
        if (!userId) {
            return res.json({
                success: false,
                message: "사용자 정보가 없습니다."
            });
        }

        if (!profileImg) {
            return res.json({
                success: false,
                message: "선택한 프로필 이미지가 없습니다."
            });
        }

        conn = await db.getConnection();

        await conn.execute(
            `
            UPDATE USERS
            SET PROFILE_IMG = :profileImg
            WHERE USER_ID = :userId
            `,
            {
                profileImg,
                userId
            },
            {
                autoCommit: true
            }
        );

        res.json({
            success: true,
            message: "프로필 이미지가 변경되었습니다.",
            profileImg
        });

    } catch (err) {
        console.log("기본 프로필 이미지 선택 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 아이디 찾기
// POST /user/find-id
// 닉네임 + 이메일로 아이디 조회
// =========================

router.post("/find-id", async (req, res) => {
    const { nickname, email } = req.body;
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT USER_ID
            FROM USERS
            WHERE NICKNAME = :nickname
            AND EMAIL = :email
            AND USER_STATUS = 'NORMAL'
            `,
            {
                nickname,
                email
            },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        if (result.rows.length === 0) {
            return res.json({
                success: false,
                message: "일치하는 회원정보가 없습니다."
            });
        }

        res.json({
            success: true,
            message: "아이디 찾기 성공",
            userId: result.rows[0].USER_ID
        });

    } catch (err) {
        console.log("아이디 찾기 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 비밀번호 재설정
// POST /user/reset-password
// 아이디 + 이메일 확인 후 새 비밀번호 저장
// =========================

router.post("/reset-password", async (req, res) => {
    const { userId, email, newPwd } = req.body;
    let conn;

    try {
        conn = await db.getConnection();

        const check = await conn.execute(
            `
            SELECT USER_ID
            FROM USERS
            WHERE USER_ID = :userId
            AND EMAIL = :email
            AND USER_STATUS = 'NORMAL'
            `,
            {
                userId,
                email
            },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        if (check.rows.length === 0) {
            return res.json({
                success: false,
                message: "일치하는 회원정보가 없습니다."
            });
        }

        const hashPwd = await bcrypt.hash(newPwd, 10);

        await conn.execute(
            `
            UPDATE USERS
            SET USER_PWD = :newPwd
            WHERE USER_ID = :userId
            `,
            {
                newPwd: hashPwd,
                userId
            },
            {
                autoCommit: true
            }
        );

        res.json({
            success: true,
            message: "비밀번호가 재설정되었습니다."
        });

    } catch (err) {
        console.log("비밀번호 재설정 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});

// =========================
// 팬랭킹 TOP10
// GET /user/ranking/top10
// =========================

router.get("/ranking/top10", async (req, res) => {
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT *
            FROM (
                SELECT
                    U.USER_ID,
                    U.NICKNAME,
                    U.PROFILE_IMG,

                    (
                        NVL((
                            SELECT COUNT(*)
                            FROM POST P
                            WHERE P.USER_ID = U.USER_ID
                            AND P.POST_STATUS = 'NORMAL'
                        ),0) * 5

                        +

                        NVL((
                            SELECT COUNT(*)
                            FROM POST_COMMENT C
                            WHERE C.USER_ID = U.USER_ID
                            AND C.COMMENT_STATUS = 'NORMAL'
                        ),0) * 2

                        +

                        NVL((
                            SELECT SUM(P2.LIKE_CNT)
                            FROM POST P2
                            WHERE P2.USER_ID = U.USER_ID
                            AND P2.POST_STATUS = 'NORMAL'
                        ),0)

                        +

                        NVL((
                            SELECT SUM(A.POINT)
                            FROM ATTENDANCE A
                            WHERE A.USER_ID = U.USER_ID
                        ),0)

                    ) AS FAN_SCORE

                FROM USERS U
                WHERE U.USER_STATUS = 'NORMAL'
                ORDER BY FAN_SCORE DESC
            )
            WHERE ROWNUM <= 10
            `,
            {},
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        res.json({
            success: true,
            list: result.rows
        });

    } catch (err) {
        console.log("팬랭킹 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});



// =========================
// 회원정보 조회
// GET /user/:userId
// 반드시 맨 아래쪽에 있어야 함
// =========================

router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                USER_ID,
                NICKNAME,
                EMAIL,
                PROFILE_IMG,
                USER_STATUS,
                CDATE
            FROM USERS
            WHERE USER_ID = :userId
            `,
            { userId },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        if (result.rows.length > 0) {
            res.json({
                success: true,
                info: result.rows[0]
            });

        } else {
            res.json({
                success: false,
                message: "회원이 없습니다."
            });
        }

    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


module.exports = router;