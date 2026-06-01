const express = require("express");
const oracledb = require("oracledb");
const db = require("../db");
const { jwtAuthentication } = require("../auth");

const router = express.Router();


// 좋아요 상태 + 개수 조회
router.get("/:postId", jwtAuthentication, async (req, res) => {

    const { postId } = req.params;
    const userId = req.user.userId;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                P.LIKE_CNT,
                CASE 
                    WHEN L.LIKE_ID IS NULL THEN 'N'
                    ELSE 'Y'
                END AS IS_LIKED
            FROM POST P
            LEFT JOIN POST_LIKE L
                ON P.POST_ID = L.POST_ID
                AND L.USER_ID = :userId
            WHERE P.POST_ID = :postId
            `,
            { postId, userId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
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
            message: "좋아요 조회 실패"
        });

    } finally {
        if (conn) await conn.close();
    }

});


// 좋아요 등록
router.post("/", jwtAuthentication, async (req, res) => {

    const { postId } = req.body;
    const userId = req.user.userId;

    let conn;

    try {
        conn = await db.getConnection();

        await conn.execute(
            `
            INSERT INTO POST_LIKE (
                LIKE_ID,
                POST_ID,
                USER_ID
            )
            VALUES (
                SEQ_POST_LIKE.NEXTVAL,
                :postId,
                :userId
            )
            `,
            { postId, userId }
        );

        await conn.execute(
            `
            UPDATE POST
            SET LIKE_CNT = LIKE_CNT + 1
            WHERE POST_ID = :postId
            `,
            { postId }
        );

        await conn.commit();

        res.json({
            success: true,
            message: "좋아요 완료"
        });

    } catch (err) {
        console.log(err);

        if (conn) await conn.rollback();

        res.status(500).json({
            success: false,
            message: "좋아요 실패"
        });

    } finally {
        if (conn) await conn.close();
    }

});


// 좋아요 취소
router.delete("/:postId", jwtAuthentication, async (req, res) => {

    const { postId } = req.params;
    const userId = req.user.userId;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            DELETE FROM POST_LIKE
            WHERE POST_ID = :postId
            AND USER_ID = :userId
            `,
            { postId, userId }
        );

        if (result.rowsAffected > 0) {
            await conn.execute(
                `
                UPDATE POST
                SET LIKE_CNT = CASE 
                    WHEN LIKE_CNT > 0 THEN LIKE_CNT - 1 
                    ELSE 0 
                END
                WHERE POST_ID = :postId
                `,
                { postId }
            );
        }

        await conn.commit();

        res.json({
            success: true,
            message: "좋아요 취소 완료"
        });

    } catch (err) {
        console.log(err);

        if (conn) await conn.rollback();

        res.status(500).json({
            success: false,
            message: "좋아요 취소 실패"
        });

    } finally {
        if (conn) await conn.close();
    }

});


module.exports = router;