const express = require("express");
const oracledb = require("oracledb");
const multer = require("multer");
const path = require("path");
const db = require("../db");

// JWT 인증 미들웨어
const { jwtAuthentication } = require("../auth");

const router = express.Router();


// =========================
// multer 이미지 업로드 설정
// =========================

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);

        cb(
            null,
            Date.now() + "_" + Math.round(Math.random() * 1000000) + ext
        );
    }
});

const upload = multer({ storage });


// =========================
// 게시글 등록 + 이미지 업로드
// POST /post/add
// =========================

router.post("/add", upload.array("images", 5), async (req, res) => {
    const { userId, title, content, postType, teamId } = req.body;

    let conn;

    try {
        conn = await db.getConnection();

        const seqResult = await conn.execute(
            `
            SELECT SEQ_POST.NEXTVAL AS POST_ID
            FROM DUAL
            `,
            {},
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        const postId = seqResult.rows[0].POST_ID;

        await conn.execute(
            `
            INSERT INTO POST (
                POST_ID,
                USER_ID,
                TITLE,
                CONTENT,
                POST_TYPE,
                TEAM_ID
            )
            VALUES (
                :postId,
                :userId,
                :title,
                :content,
                :postType,
                :teamId
            )
            `,
            {
                postId,
                userId,
                title,
                content,
                postType: postType || "FREE",
                teamId: teamId ? Number(teamId) : null
            }
        );

        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];

                await conn.execute(
                    `
                    INSERT INTO POST_IMAGE (
                        IMG_ID,
                        POST_ID,
                        IMG_NAME,
                        IMG_PATH,
                        IS_MAIN
                    )
                    VALUES (
                        SEQ_POST_IMAGE.NEXTVAL,
                        :postId,
                        :imgName,
                        :imgPath,
                        :isMain
                    )
                    `,
                    {
                        postId,
                        imgName: file.filename,
                        imgPath: "/uploads/" + file.filename,
                        isMain: i === 0 ? "Y" : "N"
                    }
                );
            }
        }

        await conn.commit();

        res.json({
            success: true,
            message: "게시글 등록 성공"
        });

    } catch (err) {
        console.log("게시글 등록 에러 :", err);

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
// 통합 게시글 목록 조회
// GET /post/list
// 작성자 팬등급 계산용 통계 + 댓글 수 포함
// =========================

router.get("/list", async (req, res) => {
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                P.POST_ID,
                P.USER_ID,
                P.TITLE,
                DBMS_LOB.SUBSTR(P.CONTENT, 4000, 1) AS CONTENT,
                P.POST_TYPE,
                P.TEAM_ID,
                NVL(P.VIEW_CNT, 0) AS VIEW_CNT,
                NVL(P.LIKE_CNT, 0) AS LIKE_CNT,

                (
                    SELECT COUNT(*)
                    FROM POST_COMMENT CMT
                    WHERE CMT.POST_ID = P.POST_ID
                    AND CMT.COMMENT_STATUS = 'NORMAL'
                ) AS COMMENT_CNT,

                P.POST_STATUS,
                P.CDATETIME,
                I.IMG_PATH AS MAIN_IMG,

                (
                    SELECT COUNT(*)
                    FROM POST P2
                    WHERE P2.USER_ID = P.USER_ID
                    AND P2.POST_STATUS = 'NORMAL'
                ) AS WRITER_POST_CNT,

                (
                    SELECT COUNT(*)
                    FROM POST_COMMENT C
                    WHERE C.USER_ID = P.USER_ID
                    AND C.COMMENT_STATUS = 'NORMAL'
                ) AS WRITER_COMMENT_CNT,

                (
                    SELECT NVL(SUM(P3.LIKE_CNT), 0)
                    FROM POST P3
                    WHERE P3.USER_ID = P.USER_ID
                    AND P3.POST_STATUS = 'NORMAL'
                ) AS WRITER_LIKE_CNT,

                (
                    SELECT T.TEAM_NAME
                    FROM USER_TEAM UT
                    JOIN TEAM T
                        ON UT.TEAM_ID = T.TEAM_ID
                    WHERE UT.USER_ID = P.USER_ID
                    AND ROWNUM = 1
                ) AS WRITER_TEAM_NAME

            FROM POST P
            LEFT JOIN POST_IMAGE I
                ON P.POST_ID = I.POST_ID
                AND I.IS_MAIN = 'Y'
            WHERE P.POST_STATUS = 'NORMAL'
            ORDER BY P.POST_ID DESC
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
        console.log("게시글 목록 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 팀 게시글 목록 조회
// GET /post/team/:teamId
// 작성자 팬등급 계산용 통계 + 댓글 수 포함
// =========================

router.get("/team/:teamId", async (req, res) => {
    const { teamId } = req.params;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                P.POST_ID,
                P.USER_ID,
                P.TITLE,
                DBMS_LOB.SUBSTR(P.CONTENT, 4000, 1) AS CONTENT,
                P.POST_TYPE,
                P.TEAM_ID,
                NVL(P.VIEW_CNT, 0) AS VIEW_CNT,
                NVL(P.LIKE_CNT, 0) AS LIKE_CNT,

                (
                    SELECT COUNT(*)
                    FROM POST_COMMENT CMT
                    WHERE CMT.POST_ID = P.POST_ID
                    AND CMT.COMMENT_STATUS = 'NORMAL'
                ) AS COMMENT_CNT,

                P.POST_STATUS,
                P.CDATETIME,
                I.IMG_PATH AS MAIN_IMG,

                (
                    SELECT COUNT(*)
                    FROM POST P2
                    WHERE P2.USER_ID = P.USER_ID
                    AND P2.POST_STATUS = 'NORMAL'
                ) AS WRITER_POST_CNT,

                (
                    SELECT COUNT(*)
                    FROM POST_COMMENT C
                    WHERE C.USER_ID = P.USER_ID
                    AND C.COMMENT_STATUS = 'NORMAL'
                ) AS WRITER_COMMENT_CNT,

                (
                    SELECT NVL(SUM(P3.LIKE_CNT), 0)
                    FROM POST P3
                    WHERE P3.USER_ID = P.USER_ID
                    AND P3.POST_STATUS = 'NORMAL'
                ) AS WRITER_LIKE_CNT,

                (
                    SELECT T.TEAM_NAME
                    FROM USER_TEAM UT
                    JOIN TEAM T
                        ON UT.TEAM_ID = T.TEAM_ID
                    WHERE UT.USER_ID = P.USER_ID
                    AND ROWNUM = 1
                ) AS WRITER_TEAM_NAME

            FROM POST P
            LEFT JOIN POST_IMAGE I
                ON P.POST_ID = I.POST_ID
                AND I.IS_MAIN = 'Y'
            WHERE P.POST_STATUS = 'NORMAL'
            AND P.TEAM_ID = :teamId
            ORDER BY P.POST_ID DESC
            `,
            {
                teamId: Number(teamId)
            },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        res.json({
            success: true,
            list: result.rows
        });

    } catch (err) {
        console.log("팀 게시글 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 게시글 상세 조회
// GET /post/view/:postId
// 작성자 팬등급 계산용 통계 포함
// =========================

router.get("/view/:postId", async (req, res) => {
    const { postId } = req.params;

    let conn;

    try {
        conn = await db.getConnection();

        await conn.execute(
            `
            UPDATE POST
            SET VIEW_CNT = NVL(VIEW_CNT, 0) + 1
            WHERE POST_ID = :postId
            AND POST_STATUS = 'NORMAL'
            `,
            { postId }
        );

        const result = await conn.execute(
            `
            SELECT
                P.POST_ID,
                P.USER_ID,
                P.TITLE,
                DBMS_LOB.SUBSTR(P.CONTENT, 4000, 1) AS CONTENT,
                P.POST_TYPE,
                P.TEAM_ID,
                NVL(P.VIEW_CNT, 0) AS VIEW_CNT,
                NVL(P.LIKE_CNT, 0) AS LIKE_CNT,
                P.POST_STATUS,
                P.CDATETIME,

                (
                    SELECT COUNT(*)
                    FROM POST P2
                    WHERE P2.USER_ID = P.USER_ID
                    AND P2.POST_STATUS = 'NORMAL'
                ) AS WRITER_POST_CNT,

                (
                    SELECT COUNT(*)
                    FROM POST_COMMENT C
                    WHERE C.USER_ID = P.USER_ID
                    AND C.COMMENT_STATUS = 'NORMAL'
                ) AS WRITER_COMMENT_CNT,

                (
                    SELECT NVL(SUM(P3.LIKE_CNT), 0)
                    FROM POST P3
                    WHERE P3.USER_ID = P.USER_ID
                    AND P3.POST_STATUS = 'NORMAL'
                ) AS WRITER_LIKE_CNT,

                (
                    SELECT T.TEAM_NAME
                    FROM USER_TEAM UT
                    JOIN TEAM T
                        ON UT.TEAM_ID = T.TEAM_ID
                    WHERE UT.USER_ID = P.USER_ID
                    AND ROWNUM = 1
                ) AS WRITER_TEAM_NAME

            FROM POST P
            WHERE P.POST_ID = :postId
            AND P.POST_STATUS = 'NORMAL'
            `,
            { postId },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        const imgResult = await conn.execute(
            `
            SELECT
                IMG_ID,
                IMG_NAME,
                IMG_PATH,
                IS_MAIN
            FROM POST_IMAGE
            WHERE POST_ID = :postId
            ORDER BY IMG_ID
            `,
            { postId },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        await conn.commit();

        if (result.rows.length > 0) {
            res.json({
                success: true,
                info: result.rows[0],
                images: imgResult.rows
            });
        } else {
            res.json({
                success: false,
                message: "게시글이 없습니다."
            });
        }

    } catch (err) {
        console.log("게시글 상세 조회 에러 :", err);

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
// 게시글 수정
// PUT /post/update/:postId
// JWT 필요
// 작성자 본인만 수정 가능
// =========================

router.put("/update/:postId", jwtAuthentication, async (req, res) => {
    const { postId } = req.params;
    const { title, content, postType, teamId } = req.body;

    const userId = req.user.userId;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            UPDATE POST
            SET
                TITLE = :title,
                CONTENT = :content,
                POST_TYPE = :postType,
                TEAM_ID = :teamId
            WHERE POST_ID = :postId
            AND USER_ID = :userId
            AND POST_STATUS = 'NORMAL'
            `,
            {
                title,
                content,
                postType: postType || "FREE",
                teamId: teamId ? Number(teamId) : null,
                postId,
                userId
            }
        );

        await conn.commit();

        res.json({
            success: result.rowsAffected > 0,
            message: result.rowsAffected > 0
                ? "게시글 수정 성공"
                : "수정 권한이 없거나 게시글이 없습니다."
        });

    } catch (err) {
        console.log("게시글 수정 에러 :", err);

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
// 게시글 삭제
// DELETE /post/delete/:postId
// JWT 필요
// 작성자 본인만 삭제 가능
// =========================

router.delete("/delete/:postId", jwtAuthentication, async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.userId;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            UPDATE POST
            SET POST_STATUS = 'DEL'
            WHERE POST_ID = :postId
            AND USER_ID = :userId
            AND POST_STATUS = 'NORMAL'
            `,
            {
                postId,
                userId
            }
        );

        await conn.commit();

        res.json({
            success: result.rowsAffected > 0,
            message: result.rowsAffected > 0
                ? "삭제 성공"
                : "삭제 권한이 없거나 게시글이 없습니다."
        });

    } catch (err) {
        console.log("게시글 삭제 에러 :", err);

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
// 내 게시글 목록 조회
// GET /post/my/:userId
// =========================

router.get("/my/:userId", async (req, res) => {
    const { userId } = req.params;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                POST_ID,
                TITLE,
                POST_TYPE,
                TEAM_ID,
                NVL(VIEW_CNT, 0) AS VIEW_CNT,
                NVL(LIKE_CNT, 0) AS LIKE_CNT,

                (
                    SELECT COUNT(*)
                    FROM POST_COMMENT CMT
                    WHERE CMT.POST_ID = POST.POST_ID
                    AND CMT.COMMENT_STATUS = 'NORMAL'
                ) AS COMMENT_CNT,

                CDATETIME
            FROM POST
            WHERE USER_ID = :userId
            AND POST_STATUS = 'NORMAL'
            ORDER BY POST_ID DESC
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
        console.log("내 게시글 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});

// =========================
// 인기글 TOP5
// GET /post/popular
// =========================

router.get("/popular", async (req, res) => {
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT *
            FROM (
                SELECT
                    POST_ID,
                    USER_ID,
                    TITLE,
                    TEAM_ID,
                    NVL(LIKE_CNT, 0) AS LIKE_CNT,
                    NVL(VIEW_CNT, 0) AS VIEW_CNT,
                    (NVL(LIKE_CNT, 0) * 10 + NVL(VIEW_CNT, 0)) AS SCORE
                FROM POST
                WHERE POST_STATUS = 'NORMAL'
                ORDER BY SCORE DESC
            )
            WHERE ROWNUM <= 5
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
        console.log("인기글 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});
// =========================
// 팀 게시글 개수 TOP3
// GET /post/team-rank
// =========================

router.get("/team-rank", async (req, res) => {
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT *
            FROM (
                SELECT
                    P.TEAM_ID,
                    T.TEAM_NAME,
                    COUNT(*) AS POST_CNT
                FROM POST P
                JOIN TEAM T
                    ON P.TEAM_ID = T.TEAM_ID
                WHERE P.POST_STATUS = 'NORMAL'
                AND P.TEAM_ID IS NOT NULL
                GROUP BY P.TEAM_ID, T.TEAM_NAME
                ORDER BY POST_CNT DESC
            )
            WHERE ROWNUM <= 3
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
        console.log("팀 게시글 순위 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});

module.exports = router;