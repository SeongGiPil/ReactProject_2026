import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function PostView() {

    // URL의 postId 값 가져오기
    const { postId } = useParams();

    // 페이지 이동 객체
    const navigate = useNavigate();

    // 게시글 상세 정보
    const [post, setPost] = useState({});

    // 수정 모드 여부
    const [isEdit, setIsEdit] = useState(false);

    // 수정할 제목/내용
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    // 게시글 상세 조회
    function fnGetPost() {
        fetch("http://localhost:3010/post/view/" + postId)
            .then(res => res.json())
            .then(data => {
                console.log(data);

                if (data.success) {
                    setPost(data.info);

                    // 수정 input에 기존 제목/내용 넣기
                    setTitle(data.info.TITLE);
                    setContent(data.info.CONTENT);
                } else {
                    alert(data.message);
                }
            })
            .catch(err => {
                console.log(err);
                alert("게시글 조회 실패");
            });
    }

    // 게시글 수정
    function fnUpdate() {

        if (!title || !content) {
            alert("제목과 내용을 입력하세요.");
            return;
        }

        fetch("http://localhost:3010/post/update/" + postId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                content
            })
        })
        .then(res => res.json())
        .then(data => {

            alert(data.message);

            if (data.success) {
                setPost({
                    ...post,
                    TITLE: title,
                    CONTENT: content
                });

                setIsEdit(false);
            }

        })
        .catch(err => {
            console.log(err);
            alert("수정 실패");
        });

    }

    // 게시글 삭제
    function fnDelete() {

        if (!window.confirm("정말 삭제하시겠습니까?")) {
            return;
        }

        fetch("http://localhost:3010/post/delete/" + postId, {
            method: "DELETE"
        })
            .then(res => res.json())
            .then(data => {

                alert(data.message);

                if (data.success) {
                    navigate("/feed");
                }

            })
            .catch(err => {
                console.log(err);
                alert("삭제 실패");
            });

    }

    // 날짜 포맷
    function fnDateFormat(date) {
        return new Date(date).toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    // 페이지 열릴 때 상세 조회
    useEffect(() => {
        fnGetPost();
    }, []);

    return (
        <div
            style={{
                width: "800px",
                margin: "30px auto",
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "30px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)"
            }}
        >
            {/* 제목 */}
            {isEdit ? (
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                        width: "100%",
                        height: "45px",
                        fontSize: "22px",
                        marginBottom: "15px",
                        padding: "0 10px",
                        boxSizing: "border-box"
                    }}
                />
            ) : (
                <h2>{post.TITLE}</h2>
            )}

            <div style={{ color: "#666", marginBottom: "10px" }}>
                작성자 : {post.USER_ID}
            </div>

            <div style={{ color: "#999", marginBottom: "20px" }}>
                작성일 : {post.CDATE && fnDateFormat(post.CDATE)}
            </div>

            <div
                style={{
                    minHeight: "200px",
                    whiteSpace: "pre-wrap",
                    borderTop: "1px solid #ddd",
                    paddingTop: "20px"
                }}
            >
                {isEdit ? (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{
                            width: "100%",
                            height: "200px",
                            padding: "10px",
                            boxSizing: "border-box",
                            resize: "none"
                        }}
                    />
                ) : (
                    post.CONTENT
                )}
            </div>

            {/* 수정 / 수정완료 버튼 */}
            {isEdit ? (
                <button
                    onClick={fnUpdate}
                    style={{
                        width: "100%",
                        height: "45px",
                        backgroundColor: "#1976d2",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginTop: "20px"
                    }}
                >
                    수정완료
                </button>
            ) : (
                <button
                    onClick={() => setIsEdit(true)}
                    style={{
                        width: "100%",
                        height: "45px",
                        backgroundColor: "#4caf50",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginTop: "20px"
                    }}
                >
                    수정
                </button>
            )}

            {/* 삭제 버튼 */}
            <button
                onClick={fnDelete}
                style={{
                    width: "100%",
                    height: "45px",
                    backgroundColor: "#ff4444",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginTop: "10px"
                }}
            >
                삭제
            </button>

            {/* 목록 이동 버튼 */}
            <button
                onClick={() => navigate("/feed")}
                style={{
                    marginTop: "10px",
                    width: "100%",
                    height: "45px",
                    cursor: "pointer"
                }}
            >
                목록으로
            </button>
        </div>
    );
}

export default PostView;