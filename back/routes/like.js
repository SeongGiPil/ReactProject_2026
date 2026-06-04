const express = require("express");
const oracledb = require("oracledb");
const db = require("../db");
const { jwtAuthentication } = require("../auth");

const router = express.Router();


// =========================
// 좋아요 상태 + 개수 조회
// GET /like/:postId
// =========================

router.get("/:postId", jwtAuthentication, async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.userId;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                NVL(P.LIKE_CNT, 0) AS LIKE_CNT,
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

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "게시글이 없습니다."
            });
        }

        res.json({
            success: true,
            info: result.rows[0]
        });

    } catch (err) {
        console.log("좋아요 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 좋아요 등록/취소
// POST /like/:postId
// 좋아요 등록 시 게시글 작성자에게 알림 생성
// =========================

router.post("/:postId", jwtAuthentication, async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.userId;

    let conn;

    try {
        conn = await db.getConnection();

        const check = await conn.execute(
            `
            SELECT LIKE_ID
            FROM POST_LIKE
            WHERE POST_ID = :postId
            AND USER_ID = :userId
            `,
            { postId, userId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (check.rows.length > 0) {
            await conn.execute(
                `
                DELETE FROM POST_LIKE
                WHERE POST_ID = :postId
                AND USER_ID = :userId
                `,
                { postId, userId }
            );

            await conn.execute(
                `
                UPDATE POST
                SET LIKE_CNT = CASE
                    WHEN NVL(LIKE_CNT, 0) > 0 THEN NVL(LIKE_CNT, 0) - 1
                    ELSE 0
                END
                WHERE POST_ID = :postId
                `,
                { postId }
            );

            await conn.commit();

            return res.json({
                success: true,
                isLiked: "N",
                message: "좋아요 취소"
            });
        }

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
            SET LIKE_CNT = NVL(LIKE_CNT, 0) + 1
            WHERE POST_ID = :postId
            `,
            { postId }
        );

        // 게시글 작성자 조회
        const postResult = await conn.execute(
            `
            SELECT USER_ID
            FROM POST
            WHERE POST_ID = :postId
            AND POST_STATUS = 'NORMAL'
            `,
            { postId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // 본인 글에 좋아요 누른 경우 알림 생성 안 함
        if (
            postResult.rows.length > 0 &&
            postResult.rows[0].USER_ID !== userId
        ) {
            await conn.execute(
                `
                INSERT INTO NOTIFICATION (
                    NOTI_ID,
                    USER_ID,
                    NOTI_TYPE,
                    REF_ID,
                    IS_READ,
                    CDATETIME
                )
                VALUES (
                    SEQ_NOTIFICATION.NEXTVAL,
                    :targetUserId,
                    'LIKE',
                    :postId,
                    'N',
                    SYSDATE
                )
                `,
                {
                    targetUserId: postResult.rows[0].USER_ID,
                    postId
                }
            );
        }

        await conn.commit();

        res.json({
            success: true,
            isLiked: "Y",
            message: "좋아요 등록"
        });

    } catch (err) {
        console.log("좋아요 등록/취소 에러 :", err);

        if (conn) await conn.rollback();

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});

module.exports = router;