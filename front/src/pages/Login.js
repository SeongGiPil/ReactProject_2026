import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {

    // 페이지 이동 객체
    const navigate = useNavigate();

    // 아이디 상태값
    const [userId, setUserId] = useState("");

    // 비밀번호 상태값
    const [pwd, setPwd] = useState("");

    // 로그인 함수
    function fnLogin() {

        // 아이디 체크
        if (!userId) {
            alert("아이디를 입력하세요.");
            return;
        }

        // 비밀번호 체크
        if (!pwd) {
            alert("비밀번호를 입력하세요.");
            return;
        }

        // 로그인 API 호출
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

            console.log(data);

            // 로그인 성공
            if (data.success) {

                // JWT 저장
                localStorage.setItem("token", data.token);

                // 사용자 정보 저장
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                alert("로그인 성공");

                // 메인 이동
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
        <div
            style={{
                width: "400px",
                margin: "100px auto",
                border: "1px solid #ddd",
                padding: "30px",
                borderRadius: "10px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)"
            }}
        >

            {/* 제목 */}
            <h2
                style={{
                    textAlign: "center",
                    marginBottom: "20px"
                }}
            >
                로그인
            </h2>

            {/* 아이디 입력 */}
            <input
                type="text"
                placeholder="아이디"
                value={userId}
                onChange={(e)=>setUserId(e.target.value)}
                style={{
                    width: "100%",
                    height: "40px",
                    marginBottom: "10px",
                    padding: "0 10px",
                    boxSizing: "border-box"
                }}
            />

            {/* 비밀번호 입력 */}
            <input
                type="password"
                placeholder="비밀번호"
                value={pwd}
                onChange={(e)=>setPwd(e.target.value)}
                style={{
                    width: "100%",
                    height: "40px",
                    marginBottom: "15px",
                    padding: "0 10px",
                    boxSizing: "border-box"
                }}
            />

            {/* 로그인 버튼 */}
            <button
                onClick={fnLogin}
                style={{
                    width: "100%",
                    height: "45px",
                    backgroundColor: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                }}
            >
                로그인
            </button>

            {/* 회원가입 이동 */}
            <div
                style={{
                    textAlign: "center",
                    marginTop: "15px"
                }}
            >
                <Link to="/join">
                    회원가입
                </Link>
            </div>

        </div>
    );
}

export default Login;