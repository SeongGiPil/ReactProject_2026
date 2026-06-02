const jwt = require("jsonwebtoken");

// =========================
// JWT 인증 미들웨어
// 로그인한 사용자만 접근 가능
// =========================
function jwtAuthentication(req, res, next) {

    // Authorization 헤더 가져오기
    const authHeader = req.headers.authorization;

    // =========================
    // Authorization 헤더 없음
    // =========================
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "로그인이 필요합니다."
        });
    }

    // =========================
    // Bearer 형식 체크
    // 예)
    // Authorization: Bearer eyJ...
    // =========================
    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "토큰 형식이 올바르지 않습니다."
        });
    }

    // Bearer 제거
    const token = authHeader.split(" ")[1];

    // 토큰 없음
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "토큰이 없습니다."
        });
    }

    try {

        // =========================
        // JWT 검증
        // =========================
        const decoded = jwt.verify(
            token,
            process.env.jwt_key
        );

        // req.user에 로그인 사용자 정보 저장
        req.user = decoded;

        // 다음 미들웨어 실행
        next();

    } catch (err) {

        console.log("JWT 검증 실패 :", err.message);

        return res.status(403).json({
            success: false,
            message: "로그인이 만료되었습니다. 다시 로그인해주세요."
        });

    }

}

module.exports = {
    jwtAuthentication
};