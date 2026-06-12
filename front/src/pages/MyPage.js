
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function MyPage() {
    const [user, setUser] = useState({});
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [profileFile, setProfileFile] = useState(null);

    const [myPostList, setMyPostList] = useState([]);
    const [myCommentList, setMyCommentList] = useState([]);
    const [myLikeList, setMyLikeList] = useState([]);

    const [teamList, setTeamList] = useState([]);
    const [selectedTeams, setSelectedTeams] = useState([]);

    const [showGradeInfo, setShowGradeInfo] = useState(false);
    const [isAttend, setIsAttend] = useState(false);

    const navigate = useNavigate();

    const [stats, setStats] = useState({
        POST_CNT: 0,
        COMMENT_CNT: 0,
        TOTAL_LIKE_CNT: 0,
        ATTEND_POINT: 0
    });

    const [followInfo, setFollowInfo] = useState({
        followerCnt: 0,
        followingCnt: 0
    });

    const teamIcons = {
        LG: "⚡",
        두산: "🐻",
        SSG: "🚀",
        KIA: "🐯",
        삼성: "🦁",
        롯데: "⚓",
        한화: "🦅",
        KT: "🧙",
        NC: "🦖",
        키움: "🦸"
    };

    function fnTypeName(type) {
        if (type === "FREE") return "자유글";
        if (type === "CHEER") return "응원글";
        if (type === "INFO") return "정보글";
        if (type === "REVIEW") return "후기글";
        return type;
    }

    function getLoginUser() {
        return JSON.parse(localStorage.getItem("user"));
    }

    function getMainTeam() {
        if (selectedTeams.length === 0) {
            return { name: "통합", icon: "⚾" };
        }

        const team = teamList.find(item => item.TEAM_ID === selectedTeams[0]);

        if (!team) {
            return { name: "통합", icon: "⚾" };
        }

        return {
            name: team.TEAM_NAME,
            icon: teamIcons[team.TEAM_NAME] || "⚾"
        };
    }

    function getFanScore() {
        return (
            Number(stats.POST_CNT || 0) * 5 +
            Number(stats.COMMENT_CNT || 0) * 2 +
            Number(stats.TOTAL_LIKE_CNT || 0) +
            Number(stats.ATTEND_POINT || 0)
        );
    }

    function getFanGrade() {
        const score = getFanScore();

        if (score >= 500) return { name: "MVP Fan", color: "#ff5722" };
        if (score >= 300) return { name: "Gold Fan", color: "#f9a825" };
        if (score >= 150) return { name: "Silver Fan", color: "#90a4ae" };
        if (score >= 50) return { name: "Bronze Fan", color: "#8d6e63" };

        return { name: "Rookie Fan", color: "#1976d2" };
    }

    function getNextGradeInfo() {
        const score = getFanScore();

        if (score >= 500) {
            return {
                nextGrade: "최고 등급 달성",
                remainScore: 0,
                needPost: 0,
                needComment: 0,
                needLike: 0,
                needAttend: 0
            };
        }

        let targetScore = 50;
        let nextGrade = "Bronze Fan";

        if (score >= 300) {
            targetScore = 500;
            nextGrade = "MVP Fan";
        } else if (score >= 150) {
            targetScore = 300;
            nextGrade = "Gold Fan";
        } else if (score >= 50) {
            targetScore = 150;
            nextGrade = "Silver Fan";
        }

        const remainScore = targetScore - score;

        return {
            nextGrade,
            remainScore,
            needPost: Math.ceil(remainScore / 5),
            needComment: Math.ceil(remainScore / 2),
            needLike: remainScore,
            needAttend: Math.ceil(remainScore / 10)
        };
    }

    function fnGetUser() {
        const loginUser = getLoginUser();
        if (!loginUser) return;

        fetch("http://192.168.30.76.3010/user/" + loginUser.USER_ID)
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

    function fnGetMyPost() {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);

        fetch("http://192.168.30.76.3010/post/my/" + decoded.userId)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setMyPostList(data.list || []);
                }
            })
            .catch(err => console.log(err));
    }

    function fnGetMyComment() {
        const loginUser = getLoginUser();
        if (!loginUser) return;

        fetch("http://192.168.30.76.3010/user/my-comments/" + loginUser.USER_ID)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setMyCommentList(data.list || []);
                }
            })
            .catch(err => console.log(err));
    }

    function fnGetMyLikePost() {
        const loginUser = getLoginUser();
        if (!loginUser) return;

        fetch("http://192.168.30.76.3010/user/my-likes/" + loginUser.USER_ID)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setMyLikeList(data.list || []);
                }
            })
            .catch(err => console.log(err));
    }

    function fnGetTeamList() {
        fetch("http://192.168.30.76.3010/team/list")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTeamList(data.list || []);
                }
            })
            .catch(err => {
                console.log(err);
                alert("팀 목록 조회 실패");
            });
    }

    function fnGetMyTeam() {
        const loginUser = getLoginUser();
        if (!loginUser) return;

        fetch("http://192.168.30.76.3010/team/my/" + loginUser.USER_ID)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const ids = data.list.map(item => item.TEAM_ID);
                    setSelectedTeams(ids);
                }
            })
            .catch(err => console.log(err));
    }

    function fnGetStats() {
        const loginUser = getLoginUser();
        if (!loginUser) return;

        fetch("http://192.168.30.76.3010/user/stats/" + loginUser.USER_ID)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStats(data.info);
                }
            })
            .catch(err => console.log(err));
    }

    function fnGetFollowInfo() {
        const loginUser = getLoginUser();
        if (!loginUser) return;

        fetch("http://192.168.30.76.3010/follow/" + loginUser.USER_ID, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
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

    function fnCheckAttendance() {
        fetch("http://192.168.30.76.3010/attendance/check", {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setIsAttend(data.isAttend);
                }
            })
            .catch(err => console.log(err));
    }

    function fnAttendance() {
        fetch("http://192.168.30.76.3010/attendance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);

                if (data.success) {
                    setIsAttend(true);
                    fnGetStats();
                }
            })
            .catch(err => console.log(err));
    }

    function fnTeamCheck(teamId) {
        if (selectedTeams.includes(teamId)) {
            setSelectedTeams(selectedTeams.filter(id => id !== teamId));
        } else {
            setSelectedTeams([...selectedTeams, teamId]);
        }
    }

    function fnUpdateTeam() {
        fetch("http://192.168.30.76.3010/team/update-user-team", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: user.USER_ID,
                teamList: selectedTeams
            })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);

                if (data.success) {
                    fnGetMyTeam();
                }
            })
            .catch(err => {
                console.log(err);
                alert("응원팀 변경 실패");
            });
    }

    function fnUpdate() {
        fetch("http://192.168.30.76.3010/user/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: user.USER_ID,
                nickname,
                email
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

    function fnProfileUpload() {
        if (!profileFile) {
            alert("이미지를 선택하세요.");
            return;
        }

        const formData = new FormData();

        formData.append("profileImg", profileFile);
        formData.append("userId", user.USER_ID);

        fetch("http://192.168.30.76.3010/user/profile-img", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);

                if (data.success) {
                    const updateUser = {
                        ...user,
                        PROFILE_IMG: data.profileImg
                    };

                    setUser(updateUser);
                    localStorage.setItem("user", JSON.stringify(updateUser));
                    setProfileFile(null);
                }
            })
            .catch(err => {
                console.log(err);
                alert("프로필 이미지 업로드 실패");
            });
    }

    useEffect(() => {
        fnGetUser();
        fnGetMyPost();
        fnGetMyComment();
        fnGetMyLikePost();
        fnGetTeamList();
        fnGetMyTeam();
        fnGetStats();
        fnCheckAttendance();
        fnGetFollowInfo();
    }, []);

    const fanScore = getFanScore();
    const fanGrade = getFanGrade();
    const nextGradeInfo = getNextGradeInfo();
    const mainTeam = getMainTeam();

    return (
        <div className="mypage-container">
            <h2 className="page-title">마이페이지</h2>

            <div className="mypage-card">
                <h3 className="section-title">회원정보수정</h3>

                <div className="profile-box">
                    {user.PROFILE_IMG ? (
                        <img
                            src={"http://192.168.30.76.3010" + user.PROFILE_IMG}
                            alt="프로필"
                            className="profile-img"
                        />
                    ) : (
                        <div
                            className="profile-img"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "40px",
                                background: "#eee"
                            }}
                        >
                            👤
                        </div>
                    )}

                    <div className="profile-info">
                        <div className="profile-name">{user.NICKNAME}</div>
                        <div className="profile-email">{user.EMAIL}</div>

                        <div className="profile-upload-area">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setProfileFile(e.target.files[0])
                                }
                            />

                            <button
                                className="insert-btn"
                                onClick={fnProfileUpload}
                            >
                                변경
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mypage-form">
                    <div className="mypage-row">
                        <strong>아이디</strong>
                        <span>{user.USER_ID}</span>
                    </div>

                    <div className="mypage-row">
                        <strong>닉네임</strong>
                        <input
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                        />
                    </div>

                    <div className="mypage-row">
                        <strong>이메일</strong>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button className="update-btn" onClick={fnUpdate}>
                        수정하기
                    </button>
                </div>
            </div>

            <div className="mypage-card">
                <h3 className="section-title">⚾ 팬 등급</h3>

                <div
                    style={{
                        padding: "20px",
                        borderRadius: "15px",
                        background: "#f5f9ff",
                        border: "1px solid #d6e6ff"
                    }}
                >
                    <div
                        style={{
                            fontSize: "30px",
                            fontWeight: "bold",
                            color: fanGrade.color
                        }}
                    >
                        {mainTeam.icon} {mainTeam.name} {fanGrade.name}
                    </div>

                    <div style={{ marginTop: "10px", fontSize: "16px" }}>
                        팬 활동지수 : <strong>{fanScore}점</strong>
                    </div>

                    <div
                        style={{
                            width: "100%",
                            height: "12px",
                            background: "#ddd",
                            borderRadius: "10px",
                            marginTop: "15px"
                        }}
                    >
                        <div
                            style={{
                                width: `${Math.min((fanScore / 500) * 100, 100)}%`,
                                height: "100%",
                                background: fanGrade.color,
                                borderRadius: "10px"
                            }}
                        />
                    </div>

                    <div style={{ marginTop: "15px" }}>
                        {nextGradeInfo.remainScore === 0 ? (
                            <strong>최고 등급을 달성했습니다! 🔥</strong>
                        ) : (
                            <>
                                다음 등급{" "}
                                <strong>
                                    {mainTeam.name} {nextGradeInfo.nextGrade}
                                </strong>
                                까지{" "}
                                <strong>{nextGradeInfo.remainScore}점</strong>{" "}
                                남았습니다.
                            </>
                        )}
                    </div>

                    {nextGradeInfo.remainScore > 0 && (
                        <div
                            style={{
                                marginTop: "12px",
                                padding: "12px",
                                background: "white",
                                borderRadius: "10px"
                            }}
                        >
                            <div>
                                📝 게시글만 작성하면{" "}
                                <strong>{nextGradeInfo.needPost}개</strong> 필요
                            </div>
                            <div>
                                💬 댓글만 작성하면{" "}
                                <strong>{nextGradeInfo.needComment}개</strong> 필요
                            </div>
                            <div>
                                ❤️ 좋아요만 받으면{" "}
                                <strong>{nextGradeInfo.needLike}개</strong> 필요
                            </div>
                            <div>
                                📅 출석만 하면{" "}
                                <strong>{nextGradeInfo.needAttend}일</strong> 더 필요
                            </div>
                        </div>
                    )}

                    <button
                        className="list-btn"
                        style={{ marginTop: "15px" }}
                        onClick={() => setShowGradeInfo(!showGradeInfo)}
                    >
                        {showGradeInfo ? "등급 조건 닫기" : "등급 조건 보기"}
                    </button>

                    {showGradeInfo && (
                        <div
                            style={{
                                marginTop: "15px",
                                padding: "15px",
                                background: "white",
                                borderRadius: "10px",
                                lineHeight: "1.8"
                            }}
                        >
                            <div>게시글 1개 = 5점</div>
                            <div>댓글 1개 = 2점</div>
                            <div>받은 좋아요 1개 = 1점</div>
                            <div>출석체크 1회 = 10점</div>
                            <hr />
                            <div>0 ~ 49점 : {mainTeam.name} Rookie Fan ⚾</div>
                            <div>50 ~ 149점 : {mainTeam.name} Bronze Fan 🥉</div>
                            <div>150 ~ 299점 : {mainTeam.name} Silver Fan 🥈</div>
                            <div>300 ~ 499점 : {mainTeam.name} Gold Fan 🥇</div>
                            <div>500점 이상 : {mainTeam.name} MVP Fan 🔥</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mypage-card">
                <h3 className="section-title">📅 출석체크</h3>

                {isAttend ? (
                    <div
                        style={{
                            padding: "20px",
                            color: "#2e7d32",
                            fontWeight: "bold",
                            fontSize: "18px"
                        }}
                    >
                        ✅ 오늘 출석 완료
                    </div>
                ) : (
                    <>
                        <p>
                            오늘 출석하면 <strong>+10 팬포인트</strong> 지급됩니다.
                        </p>

                        <button className="insert-btn" onClick={fnAttendance}>
                            출석하기
                        </button>
                    </>
                )}
            </div>

            <div className="mypage-card">
                <h3 className="section-title">활동 통계</h3>

                <div className="stats-box">
                    <div className="stats-card">
                        <div className="stats-icon">📝</div>
                        <div className="stats-value">{stats.POST_CNT}</div>
                        <div className="stats-title">게시글</div>
                    </div>

                    <div className="stats-card">
                        <div className="stats-icon">💬</div>
                        <div className="stats-value">{stats.COMMENT_CNT}</div>
                        <div className="stats-title">댓글</div>
                    </div>

                    <div className="stats-card">
                        <div className="stats-icon">❤️</div>
                        <div className="stats-value">{stats.TOTAL_LIKE_CNT}</div>
                        <div className="stats-title">받은 좋아요</div>
                    </div>

                    <div className="stats-card">
                        <div className="stats-icon">📅</div>
                        <div className="stats-value">
                            {stats.ATTEND_POINT || 0}
                        </div>
                        <div className="stats-title">출석포인트</div>
                    </div>
                </div>
            </div>

            <div className="mypage-card">
                <h3 className="section-title">👥 팔로우 정보</h3>

                <div
                    style={{
                        display: "flex",
                        gap: "30px",
                        fontSize: "20px",
                        fontWeight: "bold"
                    }}
                >
                    <div
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/follow/follower")}
                    >
                        👥 팔로워 {followInfo.followerCnt}
                    </div>

                    <div
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/follow/following")}
                    >
                        ➡️ 팔로잉 {followInfo.followingCnt}
                    </div>
                </div>
            </div>

            <div className="mypage-card">
                <h3 className="section-title">내 응원팀</h3>

                <div className="team-select-box">
                    {teamList.length === 0 ? (
                        <div>등록된 팀이 없습니다.</div>
                    ) : (
                        teamList.map(team => (
                            <label key={team.TEAM_ID} className="team-item">
                                <input
                                    type="checkbox"
                                    checked={selectedTeams.includes(team.TEAM_ID)}
                                    onChange={() => fnTeamCheck(team.TEAM_ID)}
                                />
                                {" "}
                                {team.TEAM_NAME}
                            </label>
                        ))
                    )}
                </div>

                <button className="insert-btn" onClick={fnUpdateTeam}>
                    응원팀 변경
                </button>
            </div>

            <div className="mypage-card">
                <h3 className="section-title">내 게시글</h3>

                <table>
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
                                <td colSpan="6">작성한 게시글이 없습니다.</td>
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
                                            new Date(item.CDATETIME)
                                                .toLocaleDateString("ko-KR")}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mypage-card">
                <h3 className="section-title">내 댓글</h3>

                <table>
                    <thead>
                        <tr>
                            <th>댓글번호</th>
                            <th>게시글</th>
                            <th>댓글내용</th>
                        </tr>
                    </thead>

                    <tbody>
                        {myCommentList.length === 0 ? (
                            <tr>
                                <td colSpan="3">작성한 댓글이 없습니다.</td>
                            </tr>
                        ) : (
                            myCommentList.map(item => (
                                <tr key={item.COMMENT_ID}>
                                    <td>{item.COMMENT_ID}</td>
                                    <td>{item.TITLE}</td>
                                    <td>{item.CONTENT}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mypage-card">
                <h3 className="section-title">좋아요한 게시글</h3>

                <table>
                    <thead>
                        <tr>
                            <th>게시글번호</th>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>좋아요</th>
                            <th>조회수</th>
                        </tr>
                    </thead>

                    <tbody>
                        {myLikeList.length === 0 ? (
                            <tr>
                                <td colSpan="5">좋아요한 게시글이 없습니다.</td>
                            </tr>
                        ) : (
                            myLikeList.map(item => (
                                <tr key={item.POST_ID}>
                                    <td>{item.POST_ID}</td>
                                    <td>{item.TITLE}</td>
                                    <td>{item.USER_ID}</td>
                                    <td>{item.LIKE_CNT}</td>
                                    <td>{item.VIEW_CNT}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MyPage;