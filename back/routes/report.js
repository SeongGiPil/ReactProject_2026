const express = require("express");
const oracledb = require("oracledb");
const db = require("../db");
const { jwtAuthentication } = require("../auth");

const router = express.Router();


// =========================
// 신고 등록
// POST /report
// JWT 필요
// =========================

router.post("/", jwtAuthentication, async (req, res) => {
    const { targetType, targetId, reason } = req.body;

    // JWT에서 로그인 사용자 아이디 가져오기
    const userId = req.user.userId;

    let conn;

    try {
        if (!targetType) {
            return res.json({
                success: false,
                message: "신고 대상 유형이 없습니다."
            });
        }

        if (!targetId) {
            return res.json({
                success: false,
                message: "신고 대상 번호가 없습니다."
            });
        }

        if (!reason) {
            return res.json({
                success: false,
                message: "신고 사유를 선택하세요."
            });
        }

        conn = await db.getConnection();

        // 같은 사용자가 같은 대상을 중복 신고했는지 확인
        const check = await conn.execute(
            `
            SELECT REPORT_ID
            FROM REPORT
            WHERE USER_ID = :userId
            AND TARGET_TYPE = :targetType
            AND TARGET_ID = :targetId
            `,
            {
                userId,
                targetType,
                targetId: Number(targetId)
            },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        if (check.rows.length > 0) {
            return res.json({
                success: false,
                message: "이미 신고한 게시글입니다."
            });
        }

        // 신고 등록
        await conn.execute(
            `
            INSERT INTO REPORT (
                REPORT_ID,
                USER_ID,
                TARGET_TYPE,
                TARGET_ID,
                REASON,
                REPORT_STATUS,
                CDATETIME
            )
            VALUES (
                SEQ_REPORT.NEXTVAL,
                :userId,
                :targetType,
                :targetId,
                :reason,
                'WAIT',
                SYSDATE
            )
            `,
            {
                userId,
                targetType,
                targetId: Number(targetId),
                reason
            }
        );

        await conn.commit();

        res.json({
            success: true,
            message: "신고가 접수되었습니다."
        });

    } catch (err) {
        console.log("신고 등록 에러 :", err);

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
// 내 신고 목록 조회
// GET /report/my
// JWT 필요
// =========================

router.get("/my", jwtAuthentication, async (req, res) => {
    const userId = req.user.userId;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                REPORT_ID,
                USER_ID,
                TARGET_TYPE,
                TARGET_ID,
                REASON,
                REPORT_STATUS,
                TO_CHAR(CDATETIME, 'YYYY-MM-DD HH24:MI') AS CDATETIME
            FROM REPORT
            WHERE USER_ID = :userId
            ORDER BY REPORT_ID DESC
            `,
            {
                userId
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
        console.log("내 신고 목록 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 전체 신고 목록 조회
// GET /report/list
// 관리자용으로 사용 가능
// =========================

router.get("/list", async (req, res) => {
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                REPORT_ID,
                USER_ID,
                TARGET_TYPE,
                TARGET_ID,
                REASON,
                REPORT_STATUS,
                TO_CHAR(CDATETIME, 'YYYY-MM-DD HH24:MI') AS CDATETIME
            FROM REPORT
            ORDER BY REPORT_ID DESC
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
        console.log("신고 목록 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});

// =========================
// 신고 처리
// PUT /report/:reportId
// =========================

router.put("/:reportId", async (req, res) => {

    const { reportId } = req.params;
    const { reportStatus } = req.body;

    let conn;

    try {

        if (!reportStatus) {
            return res.json({
                success: false,
                message: "처리 상태가 없습니다."
            });
        }

        conn = await db.getConnection();

        const result = await conn.execute(
            `
            UPDATE REPORT
            SET REPORT_STATUS = :reportStatus
            WHERE REPORT_ID = :reportId
            `,
            {
                reportStatus,
                reportId: Number(reportId)
            },
            {
                autoCommit: true
            }
        );

        res.json({
            success: result.rowsAffected > 0,
            message: result.rowsAffected > 0
                ? "신고 처리 완료"
                : "신고 내역이 없습니다."
        });

    } catch (err) {

        console.log("신고 처리 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {

        if (conn) await conn.close();

    }

});

module.exports = router;