const express = require("express");
const oracledb = require("oracledb");
const db = require("../db");
const { jwtAuthentication } = require("../auth");

const router = express.Router();


// =========================
// 오늘 출석 여부 조회
// GET /attendance/check
// =========================

router.get("/check", jwtAuthentication, async (req, res) => {
    const userId = req.user.userId;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT COUNT(*) AS CNT
            FROM ATTENDANCE
            WHERE USER_ID = :userId
            AND TRUNC(ATTEND_DATE) = TRUNC(SYSDATE)
            `,
            { userId },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        res.json({
            success: true,
            isAttend: result.rows[0].CNT > 0
        });

    } catch (err) {
        console.log("출석 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 출석체크
// POST /attendance
// =========================

router.post("/", jwtAuthentication, async (req, res) => {
    const userId = req.user.userId;

    let conn;

    try {
        conn = await db.getConnection();

        const check = await conn.execute(
            `
            SELECT COUNT(*) AS CNT
            FROM ATTENDANCE
            WHERE USER_ID = :userId
            AND TRUNC(ATTEND_DATE) = TRUNC(SYSDATE)
            `,
            { userId },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        if (check.rows[0].CNT > 0) {
            return res.json({
                success: false,
                message: "오늘은 이미 출석체크를 했습니다."
            });
        }

        await conn.execute(
            `
            INSERT INTO ATTENDANCE (
                ATTEND_ID,
                USER_ID,
                ATTEND_DATE,
                POINT,
                CDATETIME
            )
            VALUES (
                SEQ_ATTENDANCE.NEXTVAL,
                :userId,
                SYSDATE,
                10,
                SYSDATE
            )
            `,
            { userId }
        );

        await conn.commit();

        res.json({
            success: true,
            point: 10,
            message: "출석체크 완료! +10 팬포인트"
        });

    } catch (err) {
        console.log("출석체크 에러 :", err);

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
// 내 출석 기록
// GET /attendance/list
// =========================

router.get("/list", jwtAuthentication, async (req, res) => {
    const userId = req.user.userId;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                ATTEND_ID,
                POINT,
                TO_CHAR(ATTEND_DATE, 'YYYY-MM-DD') AS ATTEND_DATE,
                TO_CHAR(CDATETIME, 'YYYY-MM-DD HH24:MI') AS CDATETIME
            FROM ATTENDANCE
            WHERE USER_ID = :userId
            ORDER BY ATTEND_DATE DESC
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
        console.log("출석기록 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});

module.exports = router;