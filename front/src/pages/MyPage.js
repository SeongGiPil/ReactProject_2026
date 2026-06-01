import React, { useEffect, useState } from "react";

function MyPage() {

    // 사용자 정보 저장 변수
    const [user, setUser] = useState({});
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");


    // 회원정보 조회 함수
    function fnGetUser() {

        // 로그인 시 localStorage에 저장한 사용자 정보 가져오기
        const loginUser =
            JSON.parse(localStorage.getItem("user"));

        // 회원 정보 조회 API 호출
        fetch(
            "http://localhost:3010/user/" +
            loginUser.USER_ID
        )
            .then(res => res.json())
            .then(data => {

                console.log(data);

                // 조회 성공 시 화면에 출력할 user 변수에 저장
                if (data.success) {
                    setUser(data.info);
                    setNickname(data.info.NICKNAME);
                    setEmail(data.info.EMAIL);

                }

            })
            .catch(err => {

                console.log(err);

                alert("회원정보 조회 실패");

            });

    }
    // 회원정보수정
    function fnUpdate() {
        fetch("http://localhost:3010/user/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: user.USER_ID,
                nickname: nickname,
                email: email
            })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);

                if (data.success) {
                    const updateUser = {
                        ...user,
                        NICKNAME: nickname,
                        EMAIL: email
                    };

                    localStorage.setItem("user", JSON.stringify(updateUser));
                    setUser(updateUser);
                }
            });
    }


    // 페이지 최초 실행 시 회원정보 조회
    useEffect(() => {
        fnGetUser();
    }, []);

    return (
        <div
            style={{
                width: "600px",
                margin: "30px auto",
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "30px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)"
            }}
        >

            {/* 페이지 제목 */}
            <h2
                style={{
                    textAlign: "center",
                    marginBottom: "20px"
                }}
            >
                마이페이지
            </h2>

            {/* 회원 정보 영역 */}
            <div
                style={{
                    lineHeight: "40px",
                    fontSize: "18px"
                }}
            >

                <div>
                    <strong>아이디 :</strong>
                    {" "}
                    {user.USER_ID}
                </div>
                <div>
                    닉네임 :
                    <input
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                    />
                </div>

                <div>
                    이메일 :
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <button onClick={fnUpdate}>
                    수정하기
                </button>


            </div>

        </div>
    );
}

export default MyPage;