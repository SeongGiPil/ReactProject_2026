const express = require("express");
const oracledb = require("oracledb");
const db = require("../db");
const { jwtAuthentication } = require("../auth");

const router = express.Router();

// 댓글 목록 조회
router.get("/:postId", async (req, res) => {
    const { postId } = req.params;
    let connection;

    try {
        connection = await db.getConnection();

        const result = await connection.execute(
            `
            SELECT 
                C.COMMENT_ID,
                C.POST_ID,
                C.USER_ID,
                U.NICKNAME,
                C.PARENT_ID,
                C.CONTENT,
                C.COMMENT_STATUS,
                TO_CHAR(C.CDATETIME, 'YYYY-MM-DD HH24:MI') AS CDATETIME
            FROM POST_COMMENT C
            JOIN USERS U ON C.USER_ID = U.USER_ID
            WHERE C.POST_ID = :postId
            AND C.COMMENT_STATUS = 'NORMAL'
            ORDER BY NVL(C.PARENT_ID, C.COMMENT_ID), C.CDATETIME
            `,
            { postId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json({ list: result.rows });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "댓글 조회 실패" });
    } finally {
        if (connection) await connection.close();
    }
});

// 댓글 등록
router.post("/", jwtAuthentication, async (req, res) => {
    const { postId, content, parentId } = req.body;
    const userId = req.user.userId;
    let connection;

    try {
        connection = await db.getConnection();

        await connection.execute(
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
            },
            { autoCommit: true }
        );

        res.json({ result: true, message: "댓글 등록 성공" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ result: false, message: "댓글 등록 실패" });
    } finally {
        if (connection) await connection.close();
    }
});
//댓글삭제
router.delete("/:commentId", jwtAuthentication, async (req, res) => {

    const { commentId } = req.params;
    const userId = req.user.userId;

    let connection;

    try {

        connection = await db.getConnection();

        const result = await connection.execute(
            `
            UPDATE POST_COMMENT
            SET COMMENT_STATUS = 'DEL'
            WHERE COMMENT_ID = :commentId
            AND USER_ID = :userId
            `,
            {
                commentId,
                userId
            },
            { autoCommit : true }
        );

        res.json({
            result : result.rowsAffected > 0,
            message : "댓글 삭제 완료"
        });

    } catch(err){

        console.log(err);

        res.status(500).json({
            result : false,
            message : "댓글 삭제 실패"
        });

    } finally {

        if(connection){
            await connection.close();
        }

    }

});


module.exports = router;