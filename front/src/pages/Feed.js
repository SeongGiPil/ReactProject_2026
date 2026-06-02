// React 기본 훅 사용
import React, { useEffect, useState } from "react";

// 페이지 이동용 Link
import { Link } from "react-router-dom";

function Feed() {
    // 게시글 전체 목록 저장
    const [list, setList] = useState([]);

    // 검색어 저장
    const [keyword, setKeyword] = useState("");

    // 글 유형 필터
    const [typeFilter, setTypeFilter] = useState("ALL");

    // 정렬 기준
    const [sortType, setSortType] = useState("LATEST");

    // 현재 페이지
    const [page, setPage] = useState(1);

    // 한 페이지당 게시글 수
    const pageSize = 5;

    // =========================
    // 게시글 목록 조회
    // =========================
    function fnGetList() {
        fetch("http://localhost:3010/post/list")
            .then(res => res.json())
            .then(data => {
                console.log("게시글 목록 :", data);

                if (data.success) {
                    setList(data.list || []);
                }
            })
            .catch(err => {
                console.log(err);
                alert("게시글 목록 조회 실패");
            });
    }

    // =========================
    // 검색 + 필터 + 정렬 목록 만들기
    // =========================
    function fnViewList() {
        let newList = [...list];

        // 검색어 필터
        if (keyword.trim() !== "") {
            newList = newList.filter(item =>
                String(item.TITLE || "")
                    .toLowerCase()
                    .includes(keyword.toLowerCase()) ||
                String(item.CONTENT || "")
                    .toLowerCase()
                    .includes(keyword.toLowerCase()) ||
                String(item.USER_ID || "")
                    .toLowerCase()
                    .includes(keyword.toLowerCase())
            );
        }

        // 글 유형 필터
        if (typeFilter !== "ALL") {
            newList = newList.filter(item => item.POST_TYPE === typeFilter);
        }

        // 정렬
        if (sortType === "LATEST") {
            newList.sort((a, b) => b.POST_ID - a.POST_ID);
        } else if (sortType === "LIKE") {
            newList.sort((a, b) =>
                Number(b.LIKE_CNT || 0) - Number(a.LIKE_CNT || 0)
            );
        } else if (sortType === "VIEW") {
            newList.sort((a, b) =>
                Number(b.VIEW_CNT || 0) - Number(a.VIEW_CNT || 0)
            );
        }

        return newList;
    }

    // =========================
    // 게시글 타입 한글 변환
    // =========================
    function fnTypeName(type) {
        if (type === "FREE") return "자유글";
        if (type === "CHEER") return "응원글";
        if (type === "INFO") return "정보글";
        if (type === "REVIEW") return "후기글";
        return "기타";
    }

    // =========================
    // 날짜 포맷
    // =========================
    function fnDateFormat(date) {
        if (!date) return "";
        return new Date(date).toLocaleString("ko-KR");
    }

    // =========================
    // 팀 아이콘 반환
    // =========================
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

    // =========================
    // 팬등급 계산
    // 게시글 1개 = 5점
    // 댓글 1개 = 2점
    // 받은 좋아요 1개 = 1점
    // =========================
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

    // =========================
    // 검색/필터/정렬 초기화
    // =========================
    function fnReset() {
        setKeyword("");
        setTypeFilter("ALL");
        setSortType("LATEST");
        setPage(1);
    }

    // 화면 처음 실행 시 게시글 목록 조회
    useEffect(() => {
        fnGetList();
    }, []);

    // 검색 + 필터 + 정렬 적용된 목록
    const viewList = fnViewList();

    // 전체 페이지 수
    const totalPage = Math.ceil(viewList.length / pageSize) || 1;

    // 현재 페이지에 보여줄 게시글 목록
    const pageList = viewList.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    return (
        <div className="feed-container">
            <h2 className="page-title">
                게시글 목록
            </h2>

            {/* 검색창 */}
            <div className="search-box">
                <input
                    value={keyword}
                    onChange={(e) => {
                        setKeyword(e.target.value);
                        setPage(1);
                    }}
                    placeholder="제목, 내용, 작성자 검색"
                />

                <button onClick={fnReset}>
                    초기화
                </button>
            </div>

            {/* 필터 / 정렬 */}
            <div
                className="filter-box"
                style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "15px"
                }}
            >
                <select
                    value={typeFilter}
                    onChange={(e) => {
                        setTypeFilter(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="ALL">전체 유형</option>
                    <option value="FREE">자유글</option>
                    <option value="CHEER">응원글</option>
                    <option value="INFO">정보글</option>
                    <option value="REVIEW">후기글</option>
                </select>

                <select
                    value={sortType}
                    onChange={(e) => {
                        setSortType(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="LATEST">최신순</option>
                    <option value="LIKE">좋아요순</option>
                    <option value="VIEW">조회수순</option>
                </select>
            </div>

            {/* 결과 개수 */}
            <div className="search-result-count">
                총 {viewList.length}개
            </div>

            {pageList.length === 0 ? (
                <div className="empty-box">
                    게시글이 없습니다.
                </div>
            ) : (
                pageList.map(item => (
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

                        {/* 대표 이미지 썸네일 */}
                        {item.MAIN_IMG && (
                            <div style={{ marginBottom: "10px" }}>
                                <img
                                    src={"http://localhost:3010" + item.MAIN_IMG}
                                    alt="대표이미지"
                                    style={{
                                        width: "100%",
                                        maxHeight: "230px",
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

            {/* 페이징 */}
            {viewList.length > 0 && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "15px",
                        marginTop: "30px"
                    }}
                >
                    <button
                        onClick={() => {
                            if (page > 1) {
                                setPage(page - 1);
                            }
                        }}
                        disabled={page === 1}
                    >
                        {"<"}
                    </button>

                    <span>
                        {page} / {totalPage}
                    </span>

                    <button
                        onClick={() => {
                            if (page < totalPage) {
                                setPage(page + 1);
                            }
                        }}
                        disabled={page === totalPage}
                    >
                        {">"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default Feed;