const jwt = require("jsonwebtoken");

// JWT 인증 미들웨어
function jwtAuthentication(req, res, next) {

    // Authorization 헤더 가져오기
    const authHeader = req.headers.authorization;

    // 토큰이 없는 경우
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "토큰이 없습니다."
        });
    }

    // Bearer 제거
    const token = authHeader.split(" ")[1];

    try {

        // 토큰 검증
        const decoded = jwt.verify(
            token,
            process.env.jwt_key
        );

        // req에 사용자 정보 저장
        req.user = decoded;

        next();

    } catch (err) {

        return res.status(403).json({
            success: false,
            message: "유효하지 않은 토큰입니다."
        });

    }

}

module.exports = {
    jwtAuthentication
};