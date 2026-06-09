const express = require("express");
const oracledb = require("oracledb");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                FILE_NO,
                FILE_PATH,
                FILE_NAME,
                ORIGIN_NAME,
                FILE_EXT,
                IS_MAIN_BANNER,
                TO_CHAR(CDATETIME,'YYYY-MM-DD HH24:MI') AS CDATETIME
            FROM BANNER_FILE
            WHERE IS_MAIN_BANNER = 'Y'
            ORDER BY FILE_NO DESC
            `,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json({
            success: true,
            list: result.rows
        });

    } catch (err) {
        console.log("배너 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) {
            await conn.close();
        }
    }
});

module.exports = router;