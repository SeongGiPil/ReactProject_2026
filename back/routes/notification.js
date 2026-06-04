const express = require("express");
const oracledb = require("oracledb");
const db = require("../db");
const { jwtAuthentication } = require("../auth");

const router = express.Router();


// =========================
// 내 알림 목록 조회
// GET /notification/list
// JWT 필요
// =========================

router.get("/list", jwtAuthentication, async (req, res) => {
    const userId = req.user.userId;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                N.NOTI_ID,
                N.USER_ID,
                N.NOTI_TYPE,
                N.REF_ID,
                N.IS_READ,
                TO_CHAR(N.CDATETIME, 'YYYY-MM-DD HH24:MI') AS CDATETIME,

                CASE
                    WHEN N.NOTI_TYPE = 'COMMENT'
                        THEN '회원님의 게시글에 댓글이 달렸습니다.'
                    WHEN N.NOTI_TYPE = 'LIKE'
                        THEN '회원님의 게시글에 좋아요가 눌렸습니다.'
                    WHEN N.NOTI_TYPE = 'REPORT'
                        THEN '신고 처리 상태가 변경되었습니다.'
                    WHEN N.NOTI_TYPE = 'REPLY'
                        THEN '회원님의 댓글에 답글이 달렸습니다.'
                    ELSE '새 알림이 있습니다.'
                END AS MESSAGE

            FROM NOTIFICATION N
            WHERE N.USER_ID = :userId
            ORDER BY N.NOTI_ID DESC
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
        console.log("알림 목록 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 읽지 않은 알림 개수 조회
// GET /notification/count
// JWT 필요
// =========================

router.get("/count", jwtAuthentication, async (req, res) => {
    const userId = req.user.userId;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT COUNT(*) AS CNT
            FROM NOTIFICATION
            WHERE USER_ID = :userId
            AND IS_READ = 'N'
            `,
            { userId },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        res.json({
            success: true,
            count: result.rows[0].CNT
        });

    } catch (err) {
        console.log("알림 개수 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 알림 읽음 처리
// PUT /notification/read/:notiId
// JWT 필요
// =========================

router.put("/read/:notiId", jwtAuthentication, async (req, res) => {
    const { notiId } = req.params;
    const userId = req.user.userId;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            UPDATE NOTIFICATION
            SET IS_READ = 'Y'
            WHERE NOTI_ID = :notiId
            AND USER_ID = :userId
            `,
            {
                notiId: Number(notiId),
                userId
            },
            {
                autoCommit: true
            }
        );

        res.json({
            success: result.rowsAffected > 0,
            message: result.rowsAffected > 0
                ? "알림을 읽음 처리했습니다."
                : "알림 정보가 없습니다."
        });

    } catch (err) {
        console.log("알림 읽음 처리 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 전체 알림 읽음 처리
// PUT /notification/read-all
// JWT 필요
// =========================

router.put("/read-all", jwtAuthentication, async (req, res) => {
    const userId = req.user.userId;

    let conn;

    try {
        conn = await db.getConnection();

        await conn.execute(
            `
            UPDATE NOTIFICATION
            SET IS_READ = 'Y'
            WHERE USER_ID = :userId
            AND IS_READ = 'N'
            `,
            { userId },
            {
                autoCommit: true
            }
        );

        res.json({
            success: true,
            message: "모든 알림을 읽음 처리했습니다."
        });

    } catch (err) {
        console.log("전체 알림 읽음 처리 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


module.exports = router;