const express = require("express");
const oracledb = require("oracledb");
const db = require("../db");

const router = express.Router();


// 게시글 등록
router.post("/add", async (req, res) => {

    const { userId, title, content, postType } = req.body;

    let conn;

    try {

        conn = await db.getConnection();

        await conn.execute(
            `
            INSERT INTO POST (
                POST_ID,
                USER_ID,
                TITLE,
                CONTENT,
                POST_TYPE
            )
            VALUES (
                SEQ_POST.NEXTVAL,
                :userId,
                :title,
                :content,
                :postType
            )
            `,
            {
                userId,
                title,
                content,
                postType: postType || "FREE"
            },
            {
                autoCommit: true
            }
        );

        res.json({
            success: true,
            message: "게시글 등록 성공"
        });

    } catch (err) {

        console.log("게시글 등록 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {

        if (conn) await conn.close();

    }

});


// 게시글 목록 조회
router.get("/list", async (req, res) => {

    let conn;

    try {

        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                POST_ID,
                USER_ID,
                TITLE,
                DBMS_LOB.SUBSTR(CONTENT, 4000, 1) AS CONTENT,
                POST_TYPE,
                VIEW_CNT,
                LIKE_CNT,
                POST_STATUS,
                CDATETIME
            FROM POST
            WHERE POST_STATUS = 'NORMAL'
            ORDER BY POST_ID DESC
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


// 게시글 상세 조회
router.get("/view/:postId", async (req, res) => {

    const { postId } = req.params;

    let conn;

    try {

        conn = await db.getConnection();

        // 조회수 1 증가
        await conn.execute(
            `
            UPDATE POST
            SET VIEW_CNT = VIEW_CNT + 1
            WHERE POST_ID = :postId
            AND POST_STATUS = 'NORMAL'
            `,
            { postId }
        );

        const result = await conn.execute(
            `
            SELECT
                POST_ID,
                USER_ID,
                TITLE,
                DBMS_LOB.SUBSTR(CONTENT, 4000, 1) AS CONTENT,
                POST_TYPE,
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

        await conn.commit();

        if (result.rows.length > 0) {

            res.json({
                success: true,
                info: result.rows[0]
            });

        } else {

            res.json({
                success: false,
                message: "게시글이 없습니다."
            });

        }

    } catch (err) {

        console.log("게시글 상세 조회 에러 :", err);

        if (conn) {
            await conn.rollback();
        }

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {

        if (conn) await conn.close();

    }

});


// 게시글 수정
router.put("/update/:postId", async (req, res) => {

    const { postId } = req.params;
    const { title, content, postType } = req.body;

    let conn;

    try {

        conn = await db.getConnection();

        const result = await conn.execute(
            `
            UPDATE POST
            SET
                TITLE = :title,
                CONTENT = :content,
                POST_TYPE = :postType
            WHERE POST_ID = :postId
            AND POST_STATUS = 'NORMAL'
            `,
            {
                title,
                content,
                postType: postType || "FREE",
                postId
            },
            {
                autoCommit: true
            }
        );

        if (result.rowsAffected > 0) {

            res.json({
                success: true,
                message: "게시글 수정 성공"
            });

        } else {

            res.json({
                success: false,
                message: "게시글이 없습니다."
            });

        }

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


// 게시글 삭제
router.delete("/delete/:postId", async (req, res) => {

    const { postId } = req.params;

    let conn;

    try {

        conn = await db.getConnection();

        // 댓글 먼저 삭제
        await conn.execute(
            `
            DELETE FROM POST_COMMENT
            WHERE POST_ID = :postId
            `,
            { postId }
        );

        // 좋아요 먼저 삭제
        await conn.execute(
            `
            DELETE FROM POST_LIKE
            WHERE POST_ID = :postId
            `,
            { postId }
        );

        // 게시글 삭제
        const result = await conn.execute(
            `
            DELETE FROM POST
            WHERE POST_ID = :postId
            `,
            { postId }
        );

        await conn.commit();

        if (result.rowsAffected > 0) {

            res.json({
                success: true,
                message: "삭제 성공"
            });

        } else {

            res.json({
                success: false,
                message: "게시글이 없습니다."
            });

        }

    } catch (err) {

        console.log("게시글 삭제 에러 :", err);

        if (conn) {
            await conn.rollback();
        }

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {

        if (conn) {
            await conn.close();
        }

    }

});


// 내 게시글 목록 조회
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