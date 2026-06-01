import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

function MyPage() {
    const [user, setUser] = useState({});
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [profileFile, setProfileFile] = useState(null);

    const [myPostList, setMyPostList] = useState([]);

    // 전체 팀 목록
    const [teamList, setTeamList] = useState([]);

    // 내가 선택한 응원팀 ID 목록
    const [selectedTeams, setSelectedTeams] = useState([]);

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
            .catch(err => console.log(err));
    }

    // 전체 팀 목록 조회
    function fnGetTeamList() {
        fetch("http://localhost:3010/team/list")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTeamList(data.list);
                }
            })
            .catch(err => {
                console.log(err);
                alert("팀 목록 조회 실패");
            });
    }

    // 내 응원팀 조회
    function fnGetMyTeam() {
        const loginUser = JSON.parse(localStorage.getItem("user"));

        fetch("http://localhost:3010/team/my/" + loginUser.USER_ID)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const ids = data.list.map(item => item.TEAM_ID);
                    setSelectedTeams(ids);
                }
            })
            .catch(err => console.log(err));
    }

    // 응원팀 체크/해제
    function fnTeamCheck(teamId) {
        if (selectedTeams.includes(teamId)) {
            setSelectedTeams(
                selectedTeams.filter(id => id !== teamId)
            );
        } else {
            setSelectedTeams([
                ...selectedTeams,
                teamId
            ]);
        }
    }

    // 응원팀 변경 저장
    function fnUpdateTeam() {
        fetch("http://localhost:3010/team/update-user-team", {
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

    // 회원정보 수정
    function fnUpdate() {
        fetch("http://localhost:3010/user/update", {
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

    // 프로필 이미지 업로드
    function fnProfileUpload() {
        if (!profileFile) {
            alert("이미지를 선택하세요.");
            return;
        }

        const formData = new FormData();

        formData.append("profileImg", profileFile);
        formData.append("userId", user.USER_ID);

        fetch("http://localhost:3010/user/profile-img", {
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
        fnGetTeamList();
        fnGetMyTeam();
    }, []);

    return (
        <div className="mypage-container">
            <h2 className="page-title">마이페이지</h2>

            <div className="mypage-card">
                <h3 className="section-title">회원정보수정</h3>

                <div className="profile-box">
                    <img
                        src={
                            user.PROFILE_IMG
                                ? "http://localhost:3010" + user.PROFILE_IMG
                                : "https://via.placeholder.com/100"
                        }
                        alt="프로필"
                        className="profile-img"
                    />

                    <div className="profile-info">
                        <div className="profile-name">
                            {user.NICKNAME}
                        </div>

                        <div className="profile-email">
                            {user.EMAIL}
                        </div>

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
        </div>
    );
}

export default MyPage;