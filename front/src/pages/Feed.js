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
            newList.sort((a, b) => Number(b.LIKE_CNT || 0) - Number(a.LIKE_CNT || 0));
        } else if (sortType === "VIEW") {
            newList.sort((a, b) => Number(b.VIEW_CNT || 0) - Number(a.VIEW_CNT || 0));
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
    // 검색/필터 초기화
    // =========================
    function fnReset() {
        setKeyword("");
        setTypeFilter("ALL");
        setSortType("LATEST");
    }

    useEffect(() => {
        fnGetList();
    }, []);

    const viewList = fnViewList();

    return (
        <div className="feed-container">
            <h2 className="page-title">
                게시글 목록
            </h2>

            {/* 검색창 */}
            <div className="search-box">
                <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
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
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="ALL">전체 유형</option>
                    <option value="FREE">자유글</option>
                    <option value="CHEER">응원글</option>
                    <option value="INFO">정보글</option>
                    <option value="REVIEW">후기글</option>
                </select>

                <select
                    value={sortType}
                    onChange={(e) => setSortType(e.target.value)}
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

            {viewList.length === 0 ? (
                <div className="empty-box">
                    게시글이 없습니다.
                </div>
            ) : (
                viewList.map(item => (
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

                        <Link
                            to={"/post/" + item.POST_ID}
                            className="post-title-link"
                        >
                            <h3>{item.TITLE}</h3>
                        </Link>

                        <div className="post-writer">
                            작성자 : {item.USER_ID}
                        </div>

                        <div className="post-content-preview">
                            {item.CONTENT}
                        </div>

                        <div className="post-meta">
                            👀 조회수 {item.VIEW_CNT}
                            {" · "}
                            ❤️ 좋아요 {item.LIKE_CNT}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default Feed;