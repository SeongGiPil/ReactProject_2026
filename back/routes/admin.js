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

        // bcrypt 암호화 비밀번호 비교
        if (
            admin.ADMIN_PWD &&
            admin.ADMIN_PWD.startsWith("$2")
        ) {
            isMatch = await bcrypt.compare(
                adminPwd,
                admin.ADMIN_PWD
            );
        } else {
            // 테스트용 평문 비밀번호 비교
            // 나중에 운영용이면 반드시 bcrypt 저장 추천
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


module.exports = router;