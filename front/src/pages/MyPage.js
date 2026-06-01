import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

function MyPage() {
    const [user, setUser] = useState({});
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");

    // 내 게시글 목록
    const [myPostList, setMyPostList] = useState([]);

    // 게시글 유형 한글 변환
    function fnTypeName(type) {
        if (type === "FREE") return "자유글";
        if (type === "CHEER") return "응원글";
        if (type === "INFO") return "정보글";
        if (type === "REVIEW") return "후기글";
        return type;
    }

    // 회원정보 조회
    function fnGetUser() {
        const loginUser = JSON.parse(localStorage.getItem("user"));

        fetch("http://localhost:3010/user/" + loginUser.USER_ID)
            .then(res => res.json())
            .then(data => {
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

    // 내 게시글 조회
    function fnGetMyPost() {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);

        fetch("http://localhost:3010/post/my/" + decoded.userId)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setMyPostList(data.list);
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    // 회원정보 수정
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

    useEffect(() => {
        fnGetUser();
        fnGetMyPost();
    }, []);

    return (
        <div
            style={{
                width: "800px",
                margin: "30px auto",
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "30px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)"
            }}
        >
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
                마이페이지
            </h2>

            <h3
                style={{
                    marginBottom: "15px",
                    borderBottom: "2px solid #ddd",
                    paddingBottom: "10px"
                }}
            >
                회원정보수정
            </h3>

            <div style={{ lineHeight: "40px", fontSize: "18px" }}>
                <div>
                    <strong>아이디 :</strong> {user.USER_ID}
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

            <hr style={{ margin: "30px 0" }} />

            <h3
                style={{
                    marginBottom: "15px",
                    borderBottom: "2px solid #ddd",
                    paddingBottom: "10px"
                }}
            >
                내 게시글
            </h3>

            <table
                border="1"
                width="100%"
                style={{
                    borderCollapse: "collapse",
                    textAlign: "center"
                }}
            >
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>유형</th>
                        <th>제목</th>
                        <th>좋아요</th>
                        <th>조회수</th>
                        <th>작성일</th>
                    </tr>
                </thead>

                <tbody>
                    {myPostList.length === 0 ? (
                        <tr>
                            <td colSpan="6">
                                작성한 게시글이 없습니다.
                            </td>
                        </tr>
                    ) : (
                        myPostList.map(item => (
                            <tr key={item.POST_ID}>
                                <td>{item.POST_ID}</td>
                                <td>{fnTypeName(item.POST_TYPE)}</td>
                                <td>{item.TITLE}</td>
                                <td>{item.LIKE_CNT}</td>
                                <td>{item.VIEW_CNT}</td>
                                <td>
                                    {item.CDATETIME &&
                                        new Date(item.CDATETIME).toLocaleDateString("ko-KR")}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default MyPage;