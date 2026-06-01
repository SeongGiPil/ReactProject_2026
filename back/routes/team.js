const express = require("express");
const oracledb = require("oracledb");
const db = require("../db");

const router = express.Router();


// 팀 목록 조회
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
            message: "팀 목록 조회 실패"
        });

    } finally {
        if (conn) await conn.close();
    }
});


// 내가 선택한 응원팀 목록 조회
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
            message: "내 응원팀 조회 실패"
        });

    } finally {
        if (conn) await conn.close();
    }
});


// 내가 해당 팀 응원팀인지 확인
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

        console.log("팀 권한 체크:", {
            userId,
            teamId: Number(teamId),
            count: result.rows.length
        });

        res.json({
            success: true,
            allowed: result.rows.length > 0
        });

    } catch (err) {
        console.log("팀 권한 확인 에러 :", err);

        res.status(500).json({
            success: false,
            message: "팀 권한 확인 실패"
        });

    } finally {
        if (conn) await conn.close();
    }
});


// 응원팀 변경
router.post("/update-user-team", async (req, res) => {
    const { userId, teamList } = req.body;

    let conn;

    try {
        conn = await db.getConnection();

        await conn.execute(
            `
            DELETE FROM USER_TEAM
            WHERE USER_ID = :userId
            `,
            { userId }
        );

        if (teamList && teamList.length > 0) {
            for (let i = 0; i < teamList.length; i++) {
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
                        teamId: Number(teamList[i])
                    }
                );
            }
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
            message: "응원팀 변경 실패"
        });

    } finally {
        if (conn) await conn.close();
    }
});


module.exports = router;