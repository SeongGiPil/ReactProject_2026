const express = require("express");
const oracledb = require("oracledb");
const multer = require("multer");
const path = require("path");
const db = require("../db");

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

const upload = multer({
    storage: storage
});


// =========================
// 게시글 등록 + 이미지 업로드
// =========================

router.post("/add", upload.array("images", 5), async (req, res) => {
    const { userId, title, content, postType, teamId } = req.body;

    let conn;

    try {
        conn = await db.getConnection();

        // 게시글 번호 먼저 생성
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

        // 게시글 저장
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

                // 통합게시판이면 null, 팀게시판이면 숫자
                teamId: teamId ? Number(teamId) : null
            }
        );

        // 이미지가 있으면 POST_IMAGE에 저장
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
// TEAM_ID가 NULL인 글만 조회
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
                P.VIEW_CNT,
                P.LIKE_CNT,
                P.POST_STATUS,
                P.CDATETIME,
                I.IMG_PATH AS MAIN_IMG
            FROM POST P
            LEFT JOIN POST_IMAGE I
                ON P.POST_ID = I.POST_ID
                AND I.IS_MAIN = 'Y'
            WHERE P.POST_STATUS = 'NORMAL'
            AND P.TEAM_ID IS NULL
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
// /post/team/:teamId
// =========================

router.get("/team/:teamId", async (req, res) => {
    const { teamId } = req.params;
      console.log("조회할 TEAM_ID =", teamId);

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
                P.VIEW_CNT,
                P.LIKE_CNT,
                P.POST_STATUS,
                P.CDATETIME,
                I.IMG_PATH AS MAIN_IMG
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
            message: "팀 게시글 조회 실패"
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 게시글 상세 조회
// =========================

router.get("/view/:postId", async (req, res) => {
    const { postId } = req.params;

    let conn;

    try {
        conn = await db.getConnection();

        // 조회수 증가
        await conn.execute(
            `
            UPDATE POST
            SET VIEW_CNT = VIEW_CNT + 1
            WHERE POST_ID = :postId
            AND POST_STATUS = 'NORMAL'
            `,
            { postId }
        );

        // 게시글 상세 조회
        const result = await conn.execute(
            `
            SELECT
                POST_ID,
                USER_ID,
                TITLE,
                DBMS_LOB.SUBSTR(CONTENT, 4000, 1) AS CONTENT,
                POST_TYPE,
                TEAM_ID,
                VIEW_CNT,
                LIKE_CNT,
                POST_STATUS,
                CDATETIME
            FROM POST
            WHERE POST_ID = :postId
            AND POST_STATUS = 'NORMAL'
            `,
            { postId },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        // 게시글 이미지 조회
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
// =========================

router.put("/update/:postId", async (req, res) => {
    const { postId } = req.params;
    const { title, content, postType, teamId } = req.body;

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
            AND POST_STATUS = 'NORMAL'
            `,
            {
                title,
                content,
                postType: postType || "FREE",
                teamId: teamId ? Number(teamId) : null,
                postId
            },
            {
                autoCommit: true
            }
        );

        res.json({
            success: result.rowsAffected > 0,
            message: result.rowsAffected > 0
                ? "게시글 수정 성공"
                : "게시글이 없습니다."
        });

    } catch (err) {
        console.log("게시글 수정 에러 :", err);

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
// =========================

router.delete("/delete/:postId", async (req, res) => {
    const { postId } = req.params;

    let conn;

    try {
        conn = await db.getConnection();

        await conn.execute(
            `
            DELETE FROM POST_COMMENT
            WHERE POST_ID = :postId
            `,
            { postId }
        );

        await conn.execute(
            `
            DELETE FROM POST_LIKE
            WHERE POST_ID = :postId
            `,
            { postId }
        );

        await conn.execute(
            `
            DELETE FROM POST_IMAGE
            WHERE POST_ID = :postId
            `,
            { postId }
        );

        const result = await conn.execute(
            `
            DELETE FROM POST
            WHERE POST_ID = :postId
            `,
            { postId }
        );

        await conn.commit();

        res.json({
            success: result.rowsAffected > 0,
            message: result.rowsAffected > 0
                ? "삭제 성공"
                : "게시글이 없습니다."
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
                VIEW_CNT,
                LIKE_CNT,
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


module.exports = router;