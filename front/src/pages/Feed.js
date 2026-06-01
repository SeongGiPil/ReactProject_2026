import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Feed() {
    const [list, setList] = useState([]);

    function fnGetList() {
        fetch("http://localhost:3010/post/list")
            .then(res => res.json())
            .then(data => {
                console.log(data);

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
        <div
            style={{
                width: "800px",
                margin: "30px auto"
            }}
        >
            <h2
                style={{
                    textAlign: "center",
                    marginBottom: "20px"
                }}
            >
                게시글 목록
            </h2>

            {list.length === 0 ? (
                <div
                    style={{
                        textAlign: "center",
                        marginTop: "50px"
                    }}
                >
                    게시글이 없습니다.
                </div>
            ) : (
                list.map(item => {
                    return (
                        <div
                            key={item.POST_ID}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "10px",
                                padding: "20px",
                                marginBottom: "15px",
                                boxShadow: "0 0 5px rgba(0,0,0,0.1)"
                            }}
                        >
                            <div
                                style={{
                                    marginBottom: "8px",
                                    fontSize: "13px",
                                    color: "#1976d2",
                                    fontWeight: "bold"
                                }}
                            >
                                [{fnTypeName(item.POST_TYPE)}]
                            </div>

                            <Link
                                to={"/post/" + item.POST_ID}
                                style={{
                                    textDecoration: "none",
                                    color: "black"
                                }}
                            >
                                <h3>{item.TITLE}</h3>
                            </Link>

                            <div
                                style={{
                                    color: "#666",
                                    fontSize: "14px",
                                    marginBottom: "10px"
                                }}
                            >
                                작성자 : {item.USER_ID}
                            </div>

                            <div
                                style={{
                                    marginBottom: "10px",
                                    whiteSpace: "pre-wrap"
                                }}
                            >
                                {item.CONTENT}
                            </div>

                            <div
                                style={{
                                    color: "#777",
                                    fontSize: "13px",
                                    marginBottom: "5px"
                                }}
                            >
                                조회수 {item.VIEW_CNT} · 좋아요 {item.LIKE_CNT}
                            </div>

                            <div
                                style={{
                                    color: "#999",
                                    fontSize: "13px"
                                }}
                            >
                                작성일 :{" "}
                                {item.CDATETIME &&
                                    new Date(item.CDATETIME).toLocaleString("ko-KR")}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default Feed;