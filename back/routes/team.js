const express = require("express");
const oracledb = require("oracledb");
const db = require("../db");

const router = express.Router();


// =========================
// 팀 목록 조회
// GET /team/list
// 마이페이지에서 체크박스로 보여줄 팀 목록
// =========================

router.get("/list", async (req, res) => {
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                TEAM_ID,
                TEAM_NAME
            FROM TEAM
            ORDER BY TEAM_ID
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
        console.log("팀 목록 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 내가 선택한 응원팀 목록 조회
// GET /team/my/:userId
// =========================

router.get("/my/:userId", async (req, res) => {
    const { userId } = req.params;
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                UT.USER_ID,
                UT.TEAM_ID,
                T.TEAM_NAME,
                UT.CDATETIME
            FROM USER_TEAM UT
            JOIN TEAM T
                ON UT.TEAM_ID = T.TEAM_ID
            WHERE UT.USER_ID = :userId
            ORDER BY UT.TEAM_ID
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
        console.log("내 응원팀 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 내가 해당 팀 응원팀인지 확인
// GET /team/check/:userId/:teamId
// 팀 게시판 접근 가능 여부 확인용
// =========================

router.get("/check/:userId/:teamId", async (req, res) => {
    const { userId, teamId } = req.params;
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                USER_ID,
                TEAM_ID
            FROM USER_TEAM
            WHERE USER_ID = :userId
            AND TEAM_ID = :teamId
            `,
            {
                userId,
                teamId: Number(teamId)
            },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        res.json({
            success: true,
            allowed: result.rows.length > 0
        });

    } catch (err) {
        console.log("팀 권한 확인 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 응원팀 변경
// POST /team/update-user-team
// 기존 응원팀 전체 삭제 후 새로 선택한 팀 다시 등록
// =========================

router.post("/update-user-team", async (req, res) => {
    const { userId, teamList } = req.body;

    // teamList가 배열이 아닐 경우 빈 배열로 처리
    const newTeamList = Array.isArray(teamList) ? teamList : [];

    let conn;

    try {
        conn = await db.getConnection();

        if (!userId) {
            return res.json({
                success: false,
                message: "사용자 정보가 없습니다."
            });
        }

        // 기존 응원팀 삭제
        await conn.execute(
            `
            DELETE FROM USER_TEAM
            WHERE USER_ID = :userId
            `,
            { userId }
        );

        // 중복 teamId 제거
        const uniqueTeamList = [...new Set(newTeamList)];

        // 새 응원팀 등록
        for (let i = 0; i < uniqueTeamList.length; i++) {
            await conn.execute(
                `
                INSERT INTO USER_TEAM (
                    USER_ID,
                    TEAM_ID,
                    CDATETIME
                )
                VALUES (
                    :userId,
                    :teamId,
                    SYSDATE
                )
                `,
                {
                    userId,
                    teamId: Number(uniqueTeamList[i])
                }
            );
        }

        await conn.commit();

        res.json({
            success: true,
            message: "응원팀이 변경되었습니다."
        });

    } catch (err) {
        console.log("응원팀 변경 에러 :", err);

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