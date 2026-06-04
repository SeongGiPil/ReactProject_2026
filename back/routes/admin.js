const express = require("express");
const oracledb = require("oracledb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();


// =========================
// 관리자 로그인
// POST /admin/login
// =========================

router.post("/login", async (req, res) => {
    const { adminId, adminPwd } = req.body;

    let conn;

    try {
        if (!adminId || !adminPwd) {
            return res.json({
                success: false,
                message: "아이디와 비밀번호를 입력하세요."
            });
        }

        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                ADMIN_ID,
                ADMIN_PWD,
                ADMIN_NAME,
                ADMIN_STATUS
            FROM ADMIN_USER
            WHERE ADMIN_ID = :adminId
            `,
            { adminId },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        if (result.rows.length === 0) {
            return res.json({
                success: false,
                message: "관리자 정보가 없습니다."
            });
        }

        const admin = result.rows[0];

        if (admin.ADMIN_STATUS !== "NORMAL") {
            return res.json({
                success: false,
                message: "사용할 수 없는 관리자 계정입니다."
            });
        }

        let isMatch = false;

        if (admin.ADMIN_PWD && admin.ADMIN_PWD.startsWith("$2")) {
            isMatch = await bcrypt.compare(adminPwd, admin.ADMIN_PWD);
        } else {
            isMatch = adminPwd === admin.ADMIN_PWD;
        }

        if (!isMatch) {
            return res.json({
                success: false,
                message: "비밀번호가 틀렸습니다."
            });
        }

        const token = jwt.sign(
            {
                adminId: admin.ADMIN_ID,
                adminName: admin.ADMIN_NAME,
                role: "ADMIN"
            },
            process.env.jwt_key,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            success: true,
            message: "관리자 로그인 성공",
            token,
            admin: {
                ADMIN_ID: admin.ADMIN_ID,
                ADMIN_NAME: admin.ADMIN_NAME,
                ROLE: "ADMIN"
            }
        });

    } catch (err) {
        console.log("관리자 로그인 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 관리자 계정 생성
// POST /admin/create
// 테스트/개발용
// =========================

router.post("/create", async (req, res) => {
    const { adminId, adminPwd, adminName } = req.body;

    let conn;

    try {
        if (!adminId || !adminPwd) {
            return res.json({
                success: false,
                message: "관리자 아이디와 비밀번호를 입력하세요."
            });
        }

        conn = await db.getConnection();

        const check = await conn.execute(
            `
            SELECT ADMIN_ID
            FROM ADMIN_USER
            WHERE ADMIN_ID = :adminId
            `,
            { adminId },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        if (check.rows.length > 0) {
            return res.json({
                success: false,
                message: "이미 존재하는 관리자 아이디입니다."
            });
        }

        const hashPwd = await bcrypt.hash(adminPwd, 10);

        await conn.execute(
            `
            INSERT INTO ADMIN_USER (
                ADMIN_ID,
                ADMIN_PWD,
                ADMIN_NAME,
                ADMIN_STATUS,
                CDATETIME
            )
            VALUES (
                :adminId,
                :adminPwd,
                :adminName,
                'NORMAL',
                SYSDATE
            )
            `,
            {
                adminId,
                adminPwd: hashPwd,
                adminName: adminName || "관리자"
            },
            {
                autoCommit: true
            }
        );

        res.json({
            success: true,
            message: "관리자 계정이 생성되었습니다."
        });

    } catch (err) {
        console.log("관리자 계정 생성 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 관리자 게시글 목록 조회
// GET /admin/post/list
// =========================

router.get("/post/list", async (req, res) => {
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                P.POST_ID,
                P.USER_ID,
                P.TITLE,
                P.POST_TYPE,
                P.TEAM_ID,
                NVL(P.VIEW_CNT, 0) AS VIEW_CNT,
                NVL(P.LIKE_CNT, 0) AS LIKE_CNT,
                (
                    SELECT COUNT(*)
                    FROM POST_COMMENT C
                    WHERE C.POST_ID = P.POST_ID
                    AND C.COMMENT_STATUS = 'NORMAL'
                ) AS COMMENT_CNT,
                P.POST_STATUS,
                TO_CHAR(P.CDATETIME, 'YYYY-MM-DD HH24:MI') AS CDATETIME
            FROM POST P
            ORDER BY P.POST_ID DESC
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
        console.log("관리자 게시글 목록 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 관리자 게시글 삭제 처리
// DELETE /admin/post/:postId
// 실제 삭제가 아니라 POST_STATUS = 'DEL'
// =========================

router.delete("/post/:postId", async (req, res) => {
    const { postId } = req.params;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            UPDATE POST
            SET POST_STATUS = 'DEL'
            WHERE POST_ID = :postId
            `,
            {
                postId: Number(postId)
            },
            {
                autoCommit: true
            }
        );

        res.json({
            success: result.rowsAffected > 0,
            message: result.rowsAffected > 0
                ? "게시글 삭제 처리 완료"
                : "게시글이 없습니다."
        });

    } catch (err) {
        console.log("관리자 게시글 삭제 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 관리자 회원 목록 조회
// GET /admin/user/list
// =========================

router.get("/user/list", async (req, res) => {
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                U.USER_ID,
                U.NICKNAME,
                U.EMAIL,
                U.PROFILE_IMG,
                U.USER_STATUS,
                TO_CHAR(U.CDATE, 'YYYY-MM-DD HH24:MI') AS CDATETIME,

                (
                    SELECT COUNT(*)
                    FROM POST P
                    WHERE P.USER_ID = U.USER_ID
                    AND P.POST_STATUS = 'NORMAL'
                ) AS POST_CNT,

                (
                    SELECT COUNT(*)
                    FROM POST_COMMENT C
                    WHERE C.USER_ID = U.USER_ID
                    AND C.COMMENT_STATUS = 'NORMAL'
                ) AS COMMENT_CNT,

                (
                    SELECT NVL(SUM(P2.LIKE_CNT), 0)
                    FROM POST P2
                    WHERE P2.USER_ID = U.USER_ID
                    AND P2.POST_STATUS = 'NORMAL'
                ) AS TOTAL_LIKE_CNT

            FROM USERS U
            ORDER BY U.CDATE DESC
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
        console.log("관리자 회원 목록 조회 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


// =========================
// 관리자 회원 상태 변경
// PUT /admin/user/:userId/status
// status: NORMAL / BAN
// =========================

router.put("/user/:userId/status", async (req, res) => {
    const { userId } = req.params;
    const { userStatus } = req.body;

    let conn;

    try {
        if (!userStatus) {
            return res.json({
                success: false,
                message: "변경할 상태값이 없습니다."
            });
        }

        if (userStatus !== "NORMAL" && userStatus !== "BAN") {
            return res.json({
                success: false,
                message: "잘못된 상태값입니다."
            });
        }

        conn = await db.getConnection();

        const result = await conn.execute(
            `
            UPDATE USERS
            SET USER_STATUS = :userStatus
            WHERE USER_ID = :userId
            `,
            {
                userStatus,
                userId
            },
            {
                autoCommit: true
            }
        );

        res.json({
            success: result.rowsAffected > 0,
            message: result.rowsAffected > 0
                ? "회원 상태가 변경되었습니다."
                : "회원 정보가 없습니다."
        });

    } catch (err) {
        console.log("관리자 회원 상태 변경 에러 :", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        if (conn) await conn.close();
    }
});


module.exports = router;