import React, { useEffect, useState } from "react";

function AdminUser() {
    const [userList, setUserList] = useState([]);

    function fnGetUserList() {
        fetch("http://192.168.30.76.3010/admin/user/list")
            .then(res => res.json())
            .then(data => {
                console.log("관리자 회원 목록 :", data);

                if (data.success) {
                    setUserList(data.list || []);
                }
            })
            .catch(err => {
                console.log(err);
                alert("회원 목록 조회 실패");
            });
    }

    function fnUpdateUserStatus(userId, status) {
        const message =
            status === "BAN"
                ? "해당 회원을 정지 처리하시겠습니까?"
                : "해당 회원의 정지를 해제하시겠습니까?";

        if (!window.confirm(message)) {
            return;
        }

        fetch("http://192.168.30.76.3010/admin/user/" + userId + "/status", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userStatus: status
            })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);

                if (data.success) {
                    fnGetUserList();
                }
            })
            .catch(err => {
                console.log(err);
                alert("회원 상태 변경 실패");
            });
    }

    function fnStatusName(status) {
        if (status === "NORMAL") return "정상";
        if (status === "BAN") return "정지";
        return status;
    }

    function getFanScore(item) {
        return (
            Number(item.POST_CNT || 0) * 5 +
            Number(item.COMMENT_CNT || 0) * 2 +
            Number(item.TOTAL_LIKE_CNT || 0)
        );
    }

    function getFanGrade(item) {
        const score = getFanScore(item);

        if (score >= 500) return "MVP Fan";
        if (score >= 300) return "Gold Fan";
        if (score >= 150) return "Silver Fan";
        if (score >= 50) return "Bronze Fan";
        return "Rookie Fan";
    }

    useEffect(() => {
        fnGetUserList();
    }, []);

    return (
        <div className="mypage-container">
            <h2 className="page-title">
                👤 회원 관리
            </h2>

            <div className="mypage-card">
                <h3 className="section-title">
                    전체 회원 목록
                </h3>

                <table>
                    <thead>
                        <tr>
                            <th>프로필</th>
                            <th>아이디</th>
                            <th>닉네임</th>
                            <th>이메일</th>
                            <th>상태</th>
                            <th>게시글</th>
                            <th>댓글</th>
                            <th>받은 좋아요</th>
                            <th>팬등급</th>
                            <th>가입일</th>
                            <th>관리</th>
                        </tr>
                    </thead>

                    <tbody>
                        {userList.length === 0 ? (
                            <tr>
                                <td colSpan="11">
                                    회원이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            userList.map(item => (
                                <tr key={item.USER_ID}>
                                    <td>
                                        {item.PROFILE_IMG ? (
                                            <img
                                                src={
                                                    "http://192.168.30.76.3010" +
                                                    item.PROFILE_IMG
                                                }
                                                alt="프로필"
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                    borderRadius: "50%",
                                                    objectFit: "cover"
                                                }}
                                            />
                                        ) : (
                                            "👤"
                                        )}
                                    </td>

                                    <td>{item.USER_ID}</td>
                                    <td>{item.NICKNAME}</td>
                                    <td>{item.EMAIL}</td>
                                    <td>{fnStatusName(item.USER_STATUS)}</td>
                                    <td>{item.POST_CNT || 0}</td>
                                    <td>{item.COMMENT_CNT || 0}</td>
                                    <td>{item.TOTAL_LIKE_CNT || 0}</td>
                                    <td>{getFanGrade(item)}</td>
                                    <td>{item.CDATETIME}</td>

                                    <td>
                                        {item.USER_STATUS === "NORMAL" ? (
                                            <button
                                                className="delete-btn"
                                                onClick={() =>
                                                    fnUpdateUserStatus(
                                                        item.USER_ID,
                                                        "BAN"
                                                    )
                                                }
                                            >
                                                정지
                                            </button>
                                        ) : (
                                            <button
                                                className="update-btn"
                                                onClick={() =>
                                                    fnUpdateUserStatus(
                                                        item.USER_ID,
                                                        "NORMAL"
                                                    )
                                                }
                                            >
                                                해제
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminUser;