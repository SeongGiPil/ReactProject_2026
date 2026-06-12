import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function UserProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState({});
    const [postList, setPostList] = useState([]);
    const [followInfo, setFollowInfo] = useState({
        isFollowing: "N",
        followerCnt: 0,
        followingCnt: 0
    });

    const token = localStorage.getItem("token");
    const currentUser = token ? jwtDecode(token) : null;

    function fnGetUser() {
        fetch("http://localhost:3010/user/" + userId)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUser(data.info);
                }
            })
            .catch(err => console.log(err));
    }

    function fnGetPostList() {
        fetch("http://localhost:3010/post/my/" + userId)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPostList(data.list || []);
                }
            })
            .catch(err => console.log(err));
    }

    function fnGetFollowInfo() {
        if (!token) return;

        fetch("http://localhost:3010/follow/" + userId, {
            headers: {
                Authorization: "Bearer " + token
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setFollowInfo(data.info);
                }
            })
            .catch(err => console.log(err));
    }

    function fnToggleFollow() {
        if (!token) {
            alert("로그인 후 이용 가능합니다.");
            navigate("/");
            return;
        }

        fetch("http://localhost:3010/follow/" + userId, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
            }
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);

                if (data.success) {
                    fnGetFollowInfo();
                }
            })
            .catch(err => {
                console.log(err);
                alert("팔로우 처리 실패");
            });
    }

    useEffect(() => {
        fnGetUser();
        fnGetPostList();
        fnGetFollowInfo();
    }, [userId]);

    return (
        <div className="mypage-container">
            <h2 className="page-title">유저 프로필</h2>

            <div className="mypage-card">
                <div className="profile-box">
                    {user.PROFILE_IMG ? (
                        <img
                            src={"http://localhost:3010" + user.PROFILE_IMG}
                            alt="프로필"
                            className="profile-img"
                        />
                    ) : (
                        <div
                            style={{
                                width: "90px",
                                height: "90px",
                                borderRadius: "50%",
                                background: "#eee",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "35px"
                            }}
                        >
                            👤
                        </div>
                    )}

                    <div className="profile-info">
                        <div className="profile-name">{user.NICKNAME}</div>
                        <div className="profile-email">{user.EMAIL}</div>
                        <div>아이디 : {user.USER_ID}</div>

                        <div style={{ marginTop: "10px", fontWeight: "bold" }}>
                            👥 팔로워 {followInfo.followerCnt} &nbsp;
                            ➡️ 팔로잉 {followInfo.followingCnt}
                        </div>

                        {currentUser?.userId !== userId && (
                            <button
                                className="insert-btn"
                                style={{ marginTop: "12px" }}
                                onClick={fnToggleFollow}
                            >
                                {followInfo.isFollowing === "Y"
                                    ? "언팔로우"
                                    : "팔로우"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="mypage-card">
                <h3 className="section-title">작성 게시글</h3>

                <table>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>제목</th>
                            <th>좋아요</th>
                            <th>조회수</th>
                            <th>이동</th>
                        </tr>
                    </thead>

                    <tbody>
                        {postList.length === 0 ? (
                            <tr>
                                <td colSpan="5">작성한 게시글이 없습니다.</td>
                            </tr>
                        ) : (
                            postList.map(item => (
                                <tr key={item.POST_ID}>
                                    <td>{item.POST_ID}</td>
                                    <td>{item.TITLE}</td>
                                    <td>{item.LIKE_CNT}</td>
                                    <td>{item.VIEW_CNT}</td>
                                    <td>
                                        <button
                                            className="list-btn"
                                            onClick={() =>
                                                navigate("/post/" + item.POST_ID)
                                            }
                                        >
                                            보기
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <button className="list-btn" onClick={() => navigate(-1)}>
                뒤로가기
            </button>
        </div>
    );
}

export default UserProfile;