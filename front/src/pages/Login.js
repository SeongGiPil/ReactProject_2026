import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    // 로그인 유형
    // user = 일반회원
    // admin = 관리자
    const [loginType, setLoginType] = useState("user");

    const [userId, setUserId] = useState("");
    const [pwd, setPwd] = useState("");

    function fnLogin() {
        if (!userId) {
            alert("아이디를 입력하세요.");
            return;
        }

        if (!pwd) {
            alert("비밀번호를 입력하세요.");
            return;
        }

        // 로그인 유형에 따라 API 주소 변경
        const url =
            loginType === "admin"
                ? "http://192.168.30.76:3010/admin/login"
                : "http://192.168.30.76:3010/user/login";

        // 로그인 유형에 따라 보내는 데이터 이름 변경
        const body =
            loginType === "admin"
                ? {
                    adminId: userId,
                    adminPwd: pwd
                }
                : {
                    userId,
                    pwd
                };

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem("token", data.token);

                    // 관리자 로그인
                    if (loginType === "admin") {
                        localStorage.setItem("user", JSON.stringify(data.admin));

                        alert("관리자 로그인 성공");
                        navigate("/admin/report");

                    // 일반회원 로그인
                    } else {
                        localStorage.setItem("user", JSON.stringify(data.user));

                        alert("로그인 성공");
                        navigate("/main");
                    }

                } else {
                    alert(data.message);
                }
            })
            .catch(err => {
                console.log(err);
                alert("서버 오류");
            });
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">
                    SpoTalk 로그인
                </h2>

                <p className="auth-subtitle">
                    스포츠 팬 커뮤니티에 오신 것을 환영합니다.
                </p>

                {/* 로그인 유형 선택 */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "15px",
                        marginBottom: "18px"
                    }}
                >
                    <label>
                        <input
                            type="radio"
                            name="loginType"
                            value="user"
                            checked={loginType === "user"}
                            onChange={() => setLoginType("user")}
                        />
                        {" "}
                        일반회원
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="loginType"
                            value="admin"
                            checked={loginType === "admin"}
                            onChange={() => setLoginType("admin")}
                        />
                        {" "}
                        관리자
                    </label>
                </div>

                <input
                    className="auth-input"
                    type="text"
                    placeholder={
                        loginType === "admin"
                            ? "관리자 아이디"
                            : "아이디"
                    }
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                />

                <input
                    className="auth-input"
                    type="password"
                    placeholder={
                        loginType === "admin"
                            ? "관리자 비밀번호"
                            : "비밀번호"
                    }
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                />

                <button
                    className="auth-btn"
                    onClick={fnLogin}
                >
                    {loginType === "admin" ? "관리자 로그인" : "로그인"}
                </button>

                {/* 일반회원일 때만 아이디 찾기 / 비밀번호 재설정 표시 */}
                {loginType === "user" && (
                    <div
                        style={{
                            marginTop: "15px",
                            textAlign: "center"
                        }}
                    >
                        <Link
                            to="/find-id"
                            style={{
                                textDecoration: "none",
                                color: "#1976d2",
                                fontWeight: "bold"
                            }}
                        >
                            아이디 찾기
                        </Link>

                        <span style={{ margin: "0 10px" }}>
                            |
                        </span>

                        <Link
                            to="/reset-password"
                            style={{
                                textDecoration: "none",
                                color: "#1976d2",
                                fontWeight: "bold"
                            }}
                        >
                            비밀번호 재설정
                        </Link>
                    </div>
                )}

                {/* 일반회원일 때만 회원가입 표시 */}
                {loginType === "user" && (
                    <div className="auth-link-box">
                        아직 계정이 없나요?{" "}
                        <Link to="/join">
                            회원가입
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Login;