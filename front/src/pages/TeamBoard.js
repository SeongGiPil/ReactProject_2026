import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function TeamBoard() {
    // URL에서 teamId 가져오기
    const { teamId } = useParams();

    // 팀 게시판 입장 가능 여부
    const [allowed, setAllowed] = useState(false);

    // 권한 체크 완료 여부
    const [checked, setChecked] = useState(false);

    // 팀 게시글 목록
    const [postList, setPostList] = useState([]);

    // 팀 정보
    const teams = {
        1: { name: "LG", icon: "⚡" },
        2: { name: "두산", icon: "🐻" },
        3: { name: "SSG", icon: "🚀" },
        4: { name: "KIA", icon: "🐯" },
        5: { name: "삼성", icon: "🦁" },
        6: { name: "롯데", icon: "⚓" },
        7: { name: "한화", icon: "🦅" },
        8: { name: "KT", icon: "🧙" },
        9: { name: "NC", icon: "🦖" },
        10: { name: "키움", icon: "🦸" }
    };

    const team = teams[teamId];

    // 게시글 타입 한글 변환
    function fnTypeName(type) {
        if (type === "FREE") return "자유글";
        if (type === "CHEER") return "응원글";
        if (type === "INFO") return "정보글";
        if (type === "REVIEW") return "후기글";
        return "기타";
    }

    // 날짜 포맷
    function fnDateFormat(date) {
        if (!date) return "";
        return new Date(date).toLocaleString("ko-KR");
    }

    // 팀 아이콘
    function getTeamIcon(teamName) {
        if (teamName === "두산") return "🐻";
        if (teamName === "LG") return "⚡";
        if (teamName === "SSG") return "🚀";
        if (teamName === "KIA") return "🐯";
        if (teamName === "삼성") return "🦁";
        if (teamName === "롯데") return "⚓";
        if (teamName === "한화") return "🦅";
        if (teamName === "KT") return "🧙";
        if (teamName === "NC") return "🦖";
        if (teamName === "키움") return "🦸";

        return "⚾";
    }

    // 팬등급 계산
    function getFanGrade(item) {
        const score =
            Number(item.WRITER_POST_CNT || 0) * 5 +
            Number(item.WRITER_COMMENT_CNT || 0) * 2 +
            Number(item.WRITER_LIKE_CNT || 0);

        if (score >= 500) return "MVP Fan";
        if (score >= 300) return "Gold Fan";
        if (score >= 150) return "Silver Fan";
        if (score >= 50) return "Bronze Fan";

        return "Rookie Fan";
    }

    // 팀 게시판 권한 확인
    function fnCheckTeamAuth() {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
            alert("로그인이 필요합니다.");
            setAllowed(false);
            setChecked(true);
            return;
        }

        const userId = user.USER_ID || user.userId;

        fetch("http://localhost:3010/team/check/" + userId + "/" + teamId)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.allowed) {
                    setAllowed(true);
                    fnGetTeamPostList();
                } else {
                    setAllowed(false);
                }

                setChecked(true);
            })
            .catch(err => {
                console.log(err);
                setAllowed(false);
                setChecked(true);
            });
    }

    // 팀 게시글 목록 조회
    function fnGetTeamPostList() {
        fetch("http://localhost:3010/post/team/" + teamId)
            .then(res => res.json())
            .then(data => {
                console.log("팀 게시글 API 결과:", data);

                if (data.success) {
                    setPostList(data.list || []);
                }
            })
            .catch(err => {
                console.log(err);
                alert("팀 게시글 조회 실패");
            });
    }

    // teamId가 바뀔 때마다 권한 다시 확인
    useEffect(() => {
        setChecked(false);
        setAllowed(false);
        setPostList([]);
        fnCheckTeamAuth();
    }, [teamId]);

    // 권한 확인 중
    if (!checked) {
        return (
            <div className="feed-container">
                <div className="empty-box">
                    팀 게시판 권한 확인 중...
                </div>
            </div>
        );
    }

    // 권한 없음
    if (!allowed) {
        return (
            <div className="feed-container">
                <h2 className="page-title">
                    {team?.icon} {team?.name} 게시판
                </h2>

                <div className="empty-box">
                    이 팀을 응원팀으로 선택한 사용자만 입장할 수 있습니다.
                    <br />
                    응원팀이 없다면 통합게시판을 이용해주세요.
                    <br />
                    <br />

                    <Link to="/feed" className="list-btn">
                        통합게시판으로 이동
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="feed-container">
            <h2 className="page-title">
                {team?.icon} {team?.name} 게시판
            </h2>

            <div style={{ marginBottom: "20px" }}>
                <Link to="/write" className="insert-btn">
                    글쓰기
                </Link>

                {" "}

                <Link to="/feed" className="list-btn">
                    통합게시판
                </Link>
            </div>

            <div className="search-result-count">
                총 {postList.length}개
            </div>

            {postList.length === 0 ? (
                <div className="empty-box">
                    아직 이 팀 게시글이 없습니다.
                </div>
            ) : (
                postList.map(item => (
                    <div
                        key={item.POST_ID}
                        className="post-card"
                    >
                        <div className="post-card-top">
                            <span className="post-type">
                                {fnTypeName(item.POST_TYPE)}
                            </span>

                            <span className="post-date">
                                {fnDateFormat(item.CDATETIME)}
                            </span>
                        </div>

                        {/* 대표 이미지 */}
                        {item.MAIN_IMG && (
                            <div style={{ marginBottom: "10px" }}>
                                <img
                                    src={"http://localhost:3010" + item.MAIN_IMG}
                                    alt="대표이미지"
                                    style={{
                                        width: "100%",
                                        maxHeight: "250px",
                                        objectFit: "cover",
                                        borderRadius: "10px"
                                    }}
                                />
                            </div>
                        )}

                        {/* 제목 + 댓글 수 */}
                        <Link
                            to={"/post/" + item.POST_ID}
                            className="post-title-link"
                        >
                            <h3>
                                {item.TITLE}
                                {" "}
                                <span
                                    style={{
                                        color: "#1976d2",
                                        fontSize: "14px"
                                    }}
                                >
                                    [{item.COMMENT_CNT || 0}]
                                </span>
                            </h3>
                        </Link>

                        {/* 작성자 */}
                        <div className="post-writer">
                            작성자 : {item.USER_ID}
                        </div>

                        {/* 작성자 팬등급 */}
                        <div
                            style={{
                                marginTop: "5px",
                                fontSize: "13px",
                                color: "#ff9800",
                                fontWeight: "bold"
                            }}
                        >
                            {getTeamIcon(item.WRITER_TEAM_NAME)}
                            {" "}
                            {item.WRITER_TEAM_NAME || "통합"}
                            {" "}
                            {getFanGrade(item)}
                        </div>

                        {/* 내용 미리보기 */}
                        <div className="post-content-preview">
                            {item.CONTENT}
                        </div>

                        {/* 조회수 / 좋아요 / 댓글 수 */}
                        <div className="post-meta">
                            👀 조회수 {item.VIEW_CNT}
                            {" · "}
                            ❤️ 좋아요 {item.LIKE_CNT}
                            {" · "}
                            💬 댓글 {item.COMMENT_CNT || 0}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default TeamBoard;