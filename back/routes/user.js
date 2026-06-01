const express = require("express");
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const router = express.Router();

// 전체 회원 조회
router.get("/", async (req, res) => {
    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `SELECT * FROM USERS`
        );

        res.json(result.rows);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "조회 실패" });

    } finally {
        if (conn) await conn.close();
    }
});

// 아이디 중복체크
router.get("/check/:userId", async (req, res) => {
    const { userId } = req.params;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT USER_ID
            FROM USERS
            WHERE USER_ID = :userId
            `,
            { userId }
        );

        res.json({
            exists: result.rows.length > 0
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            exists: true,
            message: "중복체크 실패"
        });

    } finally {
        if (conn) await conn.close();
    }
});

// 회원가입
router.post("/join", async (req, res) => {
    const { userId, pwd, nickname, email } = req.body;

    let conn;

    try {
        conn = await db.getConnection();

        // 비밀번호 암호화
        const hashPwd = await bcrypt.hash(pwd, 10);

        await conn.execute(
            `
            INSERT INTO USERS
            (
                USER_ID,
                USER_PWD,
                NICKNAME,
                EMAIL
            )
            VALUES
            (
                :userId,
                :pwd,
                :nickname,
                :email
            )
            `,
            {
                userId,
                pwd: hashPwd,
                nickname,
                email
            },
            {
                autoCommit: true
            }
        );

        res.json({
            success: true,
            message: "회원가입 성공"
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: "회원가입 실패"
        });

    } finally {
        if (conn) await conn.close();
    }
});

// 로그인 + JWT 발급
router.post("/login", async (req, res) => {
    const { userId, pwd } = req.body;

    let conn;

    try {
        conn = await db.getConnection();

        // 아이디만 조회
        const result = await conn.execute(
            `
            SELECT
                USER_ID,
                USER_PWD,
                NICKNAME,
                EMAIL,
                PROFILE_IMG,
                USER_STATUS
            FROM USERS
            WHERE USER_ID = :userId
            `,
            { userId }
        );

        if (result.rows.length === 0) {
            return res.json({
                success: false,
                message: "아이디 또는 비밀번호가 틀렸습니다."
            });
        }

        const user = result.rows[0];

        // 암호화된 비밀번호 비교
        const isMatch = await bcrypt.compare(pwd, user.USER_PWD);

        if (!isMatch) {
            return res.json({
                success: false,
                message: "아이디 또는 비밀번호가 틀렸습니다."
            });
        }

        if (user.USER_STATUS !== "NORMAL") {
            return res.json({
                success: false,
                message: "사용할 수 없는 계정입니다."
            });
        }

        const token = jwt.sign(
            {
                userId: user.USER_ID,
                nickname: user.NICKNAME
            },
            process.env.jwt_key,
            {
                expiresIn: "1h"
            }
        );

        delete user.USER_PWD;

        res.json({
            success: true,
            message: "로그인 성공",
            token,
            user
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: "로그인 실패"
        });

    } finally {
        if (conn) await conn.close();
    }
});

// 회원정보 조회
router.get("/:userId", async (req, res) => {
    const { userId } = req.params;

    let conn;

    try {
        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                USER_ID,
                NICKNAME,
                EMAIL,
                PROFILE_IMG,
                USER_STATUS,
                CDATE
            FROM USERS
            WHERE USER_ID = :userId
            `,
            { userId }
        );

        if (result.rows.length > 0) {
            res.json({
                success: true,
                info: result.rows[0]
            });

        } else {
            res.json({
                success: false,
                message: "회원이 없습니다."
            });
        }

    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: "조회 실패"
        });

    } finally {
        if (conn) await conn.close();
    }
});

// 회원정보 수정
router.put("/update", async (req, res) => {
    const { userId, nickname, email } = req.body;

    let conn;

    try {
        conn = await db.getConnection();

        await conn.execute(
            `
            UPDATE USERS
            SET
                NICKNAME = :nickname,
                EMAIL = :email
            WHERE USER_ID = :userId
            `,
            {
                userId,
                nickname,
                email
            },
            {
                autoCommit: true
            }
        );

        res.json({
            success: true,
            message: "수정 성공"
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: "수정 실패"
        });

    } finally {
        if (conn) await conn.close();
    }
});

module.exports = router;