import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

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

        fetch("http://localhost:3010/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId,
                pwd
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));

                    alert("로그인 성공");
                    navigate("/main");
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
                <h2 className="auth-title">SpoTalk 로그인</h2>

                <p className="auth-subtitle">
                    스포츠 팬 커뮤니티에 오신 것을 환영합니다.
                </p>

                <input
                    className="auth-input"
                    type="text"
                    placeholder="아이디"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                />

                <input
                    className="auth-input"
                    type="password"
                    placeholder="비밀번호"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                />

                <button
                    className="auth-btn"
                    onClick={fnLogin}
                >
                    로그인
                </button>

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



                <div className="auth-link-box">
                    아직 계정이 없나요?{" "}
                    <Link to="/join">
                        회원가입
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;