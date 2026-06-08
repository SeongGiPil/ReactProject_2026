const express = require("express");
const oracledb = require("oracledb");
const db = require("../db");
const { jwtAuthentication } = require("../auth");

const router = express.Router();


// 내 알림 목록 조회
// GET /notification
router.get("/", jwtAuthentication, async (req, res) => {
    const loginUserId = req.user.userId;
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                NOTI_ID,
                USER_ID,
                NOTI_TYPE,
                REF_ID,
                IS_READ,
                TO_CHAR(CDATETIME, 'YYYY-MM-DD HH24:MI') AS CDATETIME
            FROM NOTIFICATION
            WHERE USER_ID = :loginUserId
            ORDER BY NOTI_ID DESC
            `,
            { loginUserId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
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


// 알림 읽음 처리
// PUT /notification/read/:notiId
router.put("/read/:notiId", jwtAuthentication, async (req, res) => {
    const loginUserId = req.user.userId;
    const { notiId } = req.params;
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            UPDATE NOTIFICATION
            SET IS_READ = 'Y'
            WHERE NOTI_ID = :notiId
            AND USER_ID = :loginUserId
            `,
            { notiId, loginUserId },
            { autoCommit: true }
        );

        res.json({
            success: result.rowsAffected > 0,
            message:
                result.rowsAffected > 0
                    ? "읽음 처리되었습니다."
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


module.exports = router;