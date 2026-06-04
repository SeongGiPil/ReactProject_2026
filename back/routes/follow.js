const express = require("express");
const oracledb = require("oracledb");
const db = require("../db");
const { jwtAuthentication } = require("../auth");

const router = express.Router();


// =========================
// 팔로우 상태 + 팔로워/팔로잉 수 조회
// GET /follow/:targetUserId
// JWT 필요
// =========================

router.get("/:targetUserId", jwtAuthentication, async (req, res) => {
    const loginUserId = req.user.userId;
    const { targetUserId } = req.params;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                (
                    SELECT COUNT(*)
                    FROM USER_FOLLOW
                    WHERE FOLLOWER_ID = :loginUserId
                    AND FOLLOWING_ID = :targetUserId
                ) AS IS_FOLLOWING,

                (
                    SELECT COUNT(*)
                    FROM USER_FOLLOW
                    WHERE FOLLOWING_ID = :targetUserId
                ) AS FOLLOWER_CNT,

                (
                    SELECT COUNT(*)
                    FROM USER_FOLLOW
                    WHERE FOLLOWER_ID = :targetUserId
                ) AS FOLLOWING_CNT

            FROM DUAL
            `,
            {
                loginUserId,
                targetUserId
            },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        res.json({
            success: true,
            info: {
                isFollowing:
                    result.rows[0].IS_FOLLOWING > 0 ? "Y" : "N",
                followerCnt: result.rows[0].FOLLOWER_CNT,
                followingCnt: result.rows[0].FOLLOWING_CNT
            }
        });

    } catch (err) {
        console.log("팔로우 상태 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 팔로우 / 언팔로우
// POST /follow/:targetUserId
// JWT 필요
// =========================

router.post("/:targetUserId", jwtAuthentication, async (req, res) => {
    const loginUserId = req.user.userId;
    const { targetUserId } = req.params;

    let conn;

    try {
        if (loginUserId === targetUserId) {
            return res.json({
                success: false,
                message: "자기 자신은 팔로우할 수 없습니다."
            });
        }

        conn = await db.getConnection();

        const check = await conn.execute(
            `
            SELECT FOLLOW_ID
            FROM USER_FOLLOW
            WHERE FOLLOWER_ID = :loginUserId
            AND FOLLOWING_ID = :targetUserId
            `,
            {
                loginUserId,
                targetUserId
            },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        if (check.rows.length > 0) {
            await conn.execute(
                `
                DELETE FROM USER_FOLLOW
                WHERE FOLLOWER_ID = :loginUserId
                AND FOLLOWING_ID = :targetUserId
                `,
                {
                    loginUserId,
                    targetUserId
                }
            );

            await conn.commit();

            return res.json({
                success: true,
                isFollowing: "N",
                message: "언팔로우 되었습니다."
            });
        }

        await conn.execute(
            `
            INSERT INTO USER_FOLLOW (
                FOLLOW_ID,
                FOLLOWER_ID,
                FOLLOWING_ID,
                CDATETIME
            )
            VALUES (
                SEQ_USER_FOLLOW.NEXTVAL,
                :loginUserId,
                :targetUserId,
                SYSDATE
            )
            `,
            {
                loginUserId,
                targetUserId
            }
        );

        await conn.commit();

        res.json({
            success: true,
            isFollowing: "Y",
            message: "팔로우 되었습니다."
        });

    } catch (err) {
        console.log("팔로우 처리 에러 :", err);

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
// 내가 팔로우한 사람 목록
// GET /follow/following/list
// JWT 필요
// =========================

router.get("/following/list", jwtAuthentication, async (req, res) => {
    const loginUserId = req.user.userId;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                U.USER_ID,
                U.NICKNAME,
                U.PROFILE_IMG,
                F.CDATETIME
            FROM USER_FOLLOW F
            JOIN USERS U
                ON F.FOLLOWING_ID = U.USER_ID
            WHERE F.FOLLOWER_ID = :loginUserId
            ORDER BY F.FOLLOW_ID DESC
            `,
            {
                loginUserId
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
        console.log("팔로잉 목록 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 나를 팔로우한 사람 목록
// GET /follow/follower/list
// JWT 필요
// =========================

router.get("/follower/list", jwtAuthentication, async (req, res) => {
    const loginUserId = req.user.userId;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                U.USER_ID,
                U.NICKNAME,
                U.PROFILE_IMG,
                F.CDATETIME
            FROM USER_FOLLOW F
            JOIN USERS U
                ON F.FOLLOWER_ID = U.USER_ID
            WHERE F.FOLLOWING_ID = :loginUserId
            ORDER BY F.FOLLOW_ID DESC
            `,
            {
                loginUserId
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
        console.log("팔로워 목록 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


module.exports = router;