import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Feed() {
    const [list, setList] = useState([]);

    function fnGetList() {
        fetch("http://localhost:3010/post/list")
            .then(res => res.json())
            .then(data => {
                console.log("게시글 목록 :", data);

                if (data.success) {
                    setList(data.list);
                }
            })
            .catch(err => {
                console.log(err);
                alert("게시글 목록 조회 실패");
            });
    }

    function fnTypeName(type) {
        if (type === "FREE") return "자유글";
        if (type === "CHEER") return "응원글";
        if (type === "INFO") return "정보글";
        if (type === "REVIEW") return "후기글";

        return "기타";
    }

    useEffect(() => {
        fnGetList();
    }, []);

    return (
        <div className="feed-container">
            <h2 className="page-title">
                게시글 목록
            </h2>

            {list.length === 0 ? (
                <div className="empty-box">
                    게시글이 없습니다.
                </div>
            ) : (
                list.map(item => (
                    <div
                        key={item.POST_ID}
                        className="post-card"
                    >
                        <div className="post-card-top">
                            <span className="post-type">
                                {fnTypeName(item.POST_TYPE)}
                            </span>

                            <span className="post-date">
                                {item.CDATETIME &&
                                    new Date(item.CDATETIME)
                                        .toLocaleString("ko-KR")}
                            </span>
                        </div>

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