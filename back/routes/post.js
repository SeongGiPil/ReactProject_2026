const express = require("express");
const db = require("../db");

const router = express.Router();

router.post("/add", async (req, res) => {

    // 프론트에서 전달받은 값
    const { userId, title, content } = req.body;

    let conn;

    try {
        conn = await db.getConnection();

        await conn.execute(
            `
            INSERT INTO POST
            (
                POST_ID,
                USER_ID,
                TITLE,
                CONTENT
            )
            VALUES
            (
                SEQ_POST.NEXTVAL,
                :userId,
                :title,
                :content
            )
            `,
            { userId, title, content },
            { autoCommit: true }
        );

        res.json({
            success: true,
            message: "게시글 등록 성공"
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: "게시글 등록 실패"
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
                CDATE
            FROM POST
            ORDER BY POST_ID DESC
            `
        );

        res.json({
            success: true,
            list: result.rows
        });

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
// 게시글 상세 조회
router.get("/view/:postId", async (req, res) => {

    // URL에서 게시글 번호 가져오기
    const { postId } = req.params;

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
                CDATE
            FROM POST
            WHERE POST_ID = :postId
            `,
            { postId }
        );

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
        console.log(err);

        res.status(500).json({
            success: false,
            message: "게시글 상세 조회 실패"
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

        const result = await conn.execute(
            `
            DELETE FROM POST
            WHERE POST_ID = :postId
            `,
            { postId },
            {
                autoCommit: true
            }
        );

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

        console.log(err);

        res.status(500).json({
            success: false,
            message: "삭제 실패"
        });

    } finally {

        if (conn) {
            await conn.close();
        }

    }

});
// 게시글 수정
router.put("/update/:postId", async (req, res) => {

    // URL에서 게시글 번호 가져오기
    const { postId } = req.params;

    // 프론트에서 수정할 제목/내용 받기
    const { title, content } = req.body;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            UPDATE POST
            SET
                TITLE = :title,
                CONTENT = :content
            WHERE POST_ID = :postId
            `,
            {
                title,
                content,
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
        console.log(err);

        res.status(500).json({
            success: false,
            message: "게시글 수정 실패"
        });

    } finally {
        if (conn) await conn.close();
    }

});


module.exports = router;