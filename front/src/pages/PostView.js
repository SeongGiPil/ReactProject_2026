import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function PostView() {
    // URL의 게시글 번호 가져오기
    const { postId } = useParams();

    // 페이지 이동 함수
    const navigate = useNavigate();

    // 게시글 상세 정보
    const [post, setPost] = useState({});

    // 수정 모드 여부
    const [isEdit, setIsEdit] = useState(false);

    // 수정 입력값
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    // 댓글 목록 / 입력값
    const [commentList, setCommentList] = useState([]);
    const [comment, setComment] = useState("");

    // 좋아요 정보
    const [likeCnt, setLikeCnt] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

    // 현재 로그인 사용자
    const token = localStorage.getItem("token");
    const currentUser = token ? jwtDecode(token) : null;

    // 게시글 상세 조회
    function fnGetPost() {
        fetch("http://localhost:3010/post/view/" + postId)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPost(data.info);
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content })
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
            });
    }

    // 게시글 삭제
    function fnDelete() {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        fetch("http://localhost:3010/post/delete/" + postId, {
            method: "DELETE"
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                if (data.success) navigate("/feed");
            });
    }

    // 댓글 목록 조회
    function fnGetCommentList() {
        fetch("http://localhost:3010/comment/" + postId)
            .then(res => res.json())
            .then(data => {
                setCommentList(data.list || []);
            })
            .catch(err => {
                console.log(err);
                setCommentList([]);
            });
    }

    // 좋아요 상태 조회
    function fnGetLike() {
        fetch("http://localhost:3010/like/" + postId, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setLikeCnt(data.info.LIKE_CNT);
                    setIsLiked(data.info.IS_LIKED === "Y");
                }
            });
    }

    // 좋아요 등록
    function fnLike() {
        fetch("http://localhost:3010/like", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({ postId })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                fnGetLike();
            });
    }

    // 좋아요 취소
    function fnUnlike() {
        fetch("http://localhost:3010/like/" + postId, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                fnGetLike();
            });
    }

    // 댓글 등록
    function fnAddComment() {
        if (!comment) {
            alert("댓글을 입력하세요.");
            return;
        }

        fetch("http://localhost:3010/comment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                postId,
                content: comment
            })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);

                if (data.result) {
                    setComment("");
                    fnGetCommentList();
                }
            });
    }

    // 댓글 삭제
    function fnDeleteComment(commentId) {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

        fetch("http://localhost:3010/comment/" + commentId, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                fnGetCommentList();
            });
    }

    // 날짜 포맷
    function fnDateFormat(date) {
        return new Date(date).toLocaleString("ko-KR");
    }

    useEffect(() => {
        fnGetPost();
        fnGetCommentList();
        fnGetLike();
    }, []);

    return (
        <div style={{ width: "800px", margin: "30px auto", border: "1px solid #ddd", borderRadius: "10px", padding: "30px" }}>
            {isEdit ? (
                <input value={title} onChange={(e) => setTitle(e.target.value)} />
            ) : (
                <h2>{post.TITLE}</h2>
            )}

            <div>작성자 : {post.USER_ID}</div>
            <div>작성일 : {post.CDATETIME && fnDateFormat(post.CDATETIME)}</div>
            <div>조회수 : {post.VIEW_CNT}</div>

            {isEdit ? (
                <textarea value={content} onChange={(e) => setContent(e.target.value)} />
            ) : (
                <div>{post.CONTENT}</div>
            )}

            <button onClick={isLiked ? fnUnlike : fnLike}>
                {isLiked ? "❤️" : "🤍"} 좋아요 {likeCnt}
            </button>

            {currentUser?.userId === post.USER_ID && (
                <>
                    {isEdit ? (
                        <button onClick={fnUpdate}>수정완료</button>
                    ) : (
                        <button onClick={() => setIsEdit(true)}>수정</button>
                    )}
                    <button onClick={fnDelete}>삭제</button>
                </>
            )}

            <button onClick={() => navigate("/feed")}>목록으로</button>

            <hr />

            <h3>댓글</h3>
            <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="댓글을 입력하세요"
            />
            <button onClick={fnAddComment}>등록</button>

            <h3>댓글 {commentList.length}개</h3>

            {commentList.map(item => (
                <div key={item.COMMENT_ID} style={{ border: "1px solid #ddd", margin: "10px 0", padding: "10px" }}>
                    <strong>{item.NICKNAME}</strong>
                    <div>{item.CONTENT}</div>
                    <small>{item.CDATETIME}</small>

                    {currentUser?.userId === item.USER_ID && (
                        <button onClick={() => fnDeleteComment(item.COMMENT_ID)}>
                            삭제
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

export default PostView;