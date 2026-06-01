import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
function Feed() {

    // 게시글 목록 상태값
    const [list, setList] = useState([]);

    // 게시글 목록 조회 함수
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

    // 페이지 처음 열릴 때 목록 조회
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
                            <Link to={"/post/" + item.POST_ID}>
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
                                    color: "#999",
                                    fontSize: "13px"
                                }}
                            >
                                작성일 :
                                {
                                    new Date(item.CDATE).toLocaleString('ko-KR')
                                }
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default Feed;