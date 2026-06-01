const express = require("express");
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
                TEAM_NAME,
                MASCOT_NAME,
                TEAM_COLOR,
                TEAM_IMG
            FROM TEAM
            ORDER BY TEAM_ID
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
            message: "팀 목록 조회 실패"
        });

    } finally {
        if (conn) await conn.close();
    }
});

module.exports = router;