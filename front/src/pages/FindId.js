import React, { useState } from "react";
import { Link } from "react-router-dom";

function FindId() {
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [foundId, setFoundId] = useState("");

    function fnFindId() {
        if (!nickname.trim()) {
            alert("닉네임을 입력하세요.");
            return;
        }

        if (!email.trim()) {
            alert("이메일을 입력하세요.");
            return;
        }

        fetch("http://localhost:3010/user/find-id", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nickname,
                email
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setFoundId(data.userId);
                } else {
                    alert(data.message);
                    setFoundId("");
                }
            })
            .catch(err => {
                console.log(err);
                alert("아이디 찾기 실패");
            });
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">
                    아이디 찾기
                </h2>

                <p className="auth-subtitle">
                    가입 시 입력한 닉네임과 이메일을 입력하세요.
                </p>

                <input
                    className="auth-input"
                    type="text"
                    placeholder="닉네임"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />

                <input
                    className="auth-input"
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button
                    className="auth-btn"
                    onClick={fnFindId}
                >
                    아이디 찾기
                </button>

                {foundId && (
                    <div
                        style={{
                            marginTop: "20px",
                            padding: "15px",
                            background: "#f5f9ff",
                            borderRadius: "10px",
                            textAlign: "center",
                            fontWeight: "bold"
                        }}
                    >
                        찾은 아이디 : {foundId}
                    </div>
                )}

                <div className="auth-link-box">
                    <Link to="/">
                        로그인으로 이동
                    </Link>

                    {" | "}

                    <Link to="/reset-password">
                        비밀번호 재설정
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default FindId;