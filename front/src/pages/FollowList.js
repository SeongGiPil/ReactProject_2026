import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function FollowList() {
    const navigate = useNavigate();
    const location = useLocation();

    const [list, setList] = useState([]);

    const isFollowerPage = location.pathname === "/follow/follower";

    function fnGetList() {
        const url = isFollowerPage
            ? "http://192.168.30.76.3010/follow/follower/list"
            : "http://192.168.30.76.3010/follow/following/list";

        fetch(url, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log("팔로우 목록 :", data);

                if (data.success) {
                    setList(data.list || []);
                }
            })
            .catch(err => {
                console.log(err);
                alert("팔로우 목록 조회 실패");
            });
    }

    useEffect(() => {
        fnGetList();
    }, [location.pathname]);

    return (
        <div className="mypage-container">
            <h2 className="page-title">
                {isFollowerPage ? "👥 팔로워 목록" : "➡️ 팔로잉 목록"}
            </h2>

            <div className="mypage-card">
                {list.length === 0 ? (
                    <div
                        style={{
                            padding: "20px",
                            textAlign: "center",
                            color: "#777"
                        }}
                    >
                        목록이 없습니다.
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>프로필</th>
                                <th>아이디</th>
                                <th>닉네임</th>
                                <th>날짜</th>
                                <th>이동</th>
                            </tr>
                        </thead>

                        <tbody>
                            {list.map(item => (
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
                                                    width: "45px",
                                                    height: "45px",
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
                                    <td>
                                        {item.CDATETIME &&
                                            new Date(item.CDATETIME)
                                                .toLocaleDateString("ko-KR")}
                                    </td>

                                    <td>
                                        <button
                                            className="list-btn"
                                            onClick={() =>
                                                navigate("/user/" + item.USER_ID)
                                            }
                                        >
                                            프로필
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default FollowList;