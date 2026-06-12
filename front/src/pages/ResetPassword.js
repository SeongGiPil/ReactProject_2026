import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ResetPassword() {
    const navigate = useNavigate();

    const [userId, setUserId] = useState("");
    const [email, setEmail] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [newPwdCheck, setNewPwdCheck] = useState("");

    function fnResetPassword() {
        if (!userId.trim()) {
            alert("아이디를 입력하세요.");
            return;
        }

        if (!email.trim()) {
            alert("이메일을 입력하세요.");
            return;
        }

        if (!newPwd.trim()) {
            alert("새 비밀번호를 입력하세요.");
            return;
        }

        if (newPwd !== newPwdCheck) {
            alert("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        fetch("http://192.168.30.76.3010/user/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId,
                email,
                newPwd
            })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);

                if (data.success) {
                    navigate("/");
                }
            })
            .catch(err => {
                console.log(err);
                alert("비밀번호 재설정 실패");
            });
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">
                    비밀번호 재설정
                </h2>

                <p className="auth-subtitle">
                    아이디와 이메일 확인 후 새 비밀번호로 변경합니다.
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
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    className="auth-input"
                    type="password"
                    placeholder="새 비밀번호"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                />

                <input
                    className="auth-input"
                    type="password"
                    placeholder="새 비밀번호 확인"
                    value={newPwdCheck}
                    onChange={(e) => setNewPwdCheck(e.target.value)}
                />

                <button
                    className="auth-btn"
                    onClick={fnResetPassword}
                >
                    비밀번호 재설정
                </button>

                <div className="auth-link-box">
                    <Link to="/">
                        로그인으로 이동
                    </Link>

                    {" | "}

                    <Link to="/find-id">
                        아이디 찾기
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;