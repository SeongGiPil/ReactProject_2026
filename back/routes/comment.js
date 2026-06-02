const express = require("express");
const oracledb = require("oracledb");
const db = require("../db");
const { jwtAuthentication } = require("../auth");

const router = express.Router();


// =========================
// 댓글 목록 조회
// GET /comment/:postId
// 댓글 작성자 팬등급 계산용 데이터 포함
// =========================

router.get("/:postId", async (req, res) => {
    const { postId } = req.params;
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT 
                C.COMMENT_ID,
                C.POST_ID,
                C.USER_ID,
                U.NICKNAME,
                C.PARENT_ID,
                DBMS_LOB.SUBSTR(C.CONTENT, 4000, 1) AS CONTENT,
                C.COMMENT_STATUS,
                TO_CHAR(C.CDATETIME, 'YYYY-MM-DD HH24:MI') AS CDATETIME,

                (
                    SELECT COUNT(*)
                    FROM POST P
                    WHERE P.USER_ID = C.USER_ID
                    AND P.POST_STATUS = 'NORMAL'
                ) AS WRITER_POST_CNT,

                (
                    SELECT COUNT(*)
                    FROM POST_COMMENT C2
                    WHERE C2.USER_ID = C.USER_ID
                    AND C2.COMMENT_STATUS = 'NORMAL'
                ) AS WRITER_COMMENT_CNT,

                (
                    SELECT NVL(SUM(P2.LIKE_CNT), 0)
                    FROM POST P2
                    WHERE P2.USER_ID = C.USER_ID
                    AND P2.POST_STATUS = 'NORMAL'
                ) AS WRITER_LIKE_CNT,

                (
                    SELECT T.TEAM_NAME
                    FROM USER_TEAM UT
                    JOIN TEAM T
                        ON UT.TEAM_ID = T.TEAM_ID
                    WHERE UT.USER_ID = C.USER_ID
                    AND ROWNUM = 1
                ) AS WRITER_TEAM_NAME

            FROM POST_COMMENT C
            JOIN USERS U
                ON C.USER_ID = U.USER_ID
            WHERE C.POST_ID = :postId
            AND C.COMMENT_STATUS = 'NORMAL'
            ORDER BY NVL(C.PARENT_ID, C.COMMENT_ID), C.CDATETIME
            `,
            { postId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json({
            success: true,
            list: result.rows
        });

    } catch (err) {
        console.log("댓글 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 댓글 등록
// POST /comment
// JWT 필요
// =========================

router.post("/", jwtAuthentication, async (req, res) => {
    const { postId, content, parentId } = req.body;

    // JWT에서 로그인 사용자 아이디 가져오기
    const userId = req.user.userId;

    let conn;

    try {
        conn = await db.getConnection();

        if (!content || content.trim() === "") {
            return res.json({
                success: false,
                message: "댓글 내용을 입력하세요."
            });
        }

        await conn.execute(
            `
            INSERT INTO POST_COMMENT (
                COMMENT_ID,
                POST_ID,
                USER_ID,
                PARENT_ID,
                CONTENT
            )
            VALUES (
                SEQ_POST_COMMENT.NEXTVAL,
                :postId,
                :userId,
                :parentId,
                :content
            )
            `,
            {
                postId,
                userId,
                parentId: parentId || null,
                content
            }
        );

        await conn.commit();

        res.json({
            success: true,
            result: true,
            message: "댓글 등록 성공"
        });

    } catch (err) {
        console.log("댓글 등록 에러 :", err);

        if (conn) await conn.rollback();

        res.status(500).json({
            success: false,
            result: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 댓글 삭제
// DELETE /comment/:commentId
// JWT 필요
// 작성자 본인만 삭제 가능
// 실제 삭제가 아니라 COMMENT_STATUS = 'DEL'
// =========================

router.delete("/:commentId", jwtAuthentication, async (req, res) => {
    const { commentId } = req.params;

    // JWT에서 로그인 사용자 아이디 가져오기
    const userId = req.user.userId;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            UPDATE POST_COMMENT
            SET COMMENT_STATUS = 'DEL'
            WHERE COMMENT_ID = :commentId
            AND USER_ID = :userId
            AND COMMENT_STATUS = 'NORMAL'
            `,
            {
                commentId,
                userId
            }
        );

        await conn.commit();

        res.json({
            success: result.rowsAffected > 0,
            result: result.rowsAffected > 0,
            message: result.rowsAffected > 0
                ? "댓글 삭제 완료"
                : "삭제할 댓글이 없습니다."
        });

    } catch (err) {
        console.log("댓글 삭제 에러 :", err);

        if (conn) await conn.rollback();

        res.status(500).json({
            success: false,
            result: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


module.exports = router;