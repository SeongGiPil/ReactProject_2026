import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function PostView() {
    // URL의 postId 값 가져오기
    const { postId } = useParams();

    // 페이지 이동 함수
    const navigate = useNavigate();

    // 게시글 정보
    const [post, setPost] = useState({});

    // 게시글 이미지 목록
    const [images, setImages] = useState([]);

    // 수정 모드 여부
    const [isEdit, setIsEdit] = useState(false);

    // 수정용 제목 / 내용
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    // 댓글 목록 / 입력 댓글
    const [commentList, setCommentList] = useState([]);
    const [comment, setComment] = useState("");

    // 좋아요 수 / 좋아요 여부
    const [likeCnt, setLikeCnt] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

    // 로그인 토큰
    const token = localStorage.getItem("token");

    // 현재 로그인 사용자
    const currentUser = token ? jwtDecode(token) : null;

    // =========================
    // 게시글 상세 조회
    // =========================
    function fnGetPost() {
        fetch("http://localhost:3010/post/view/" + postId)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPost(data.info);
                    setTitle(data.info.TITLE);
                    setContent(data.info.CONTENT);
                    setImages(data.images || []);
                } else {
                    alert(data.message);
                }
            })
            .catch(err => {
                console.log(err);
                alert("게시글 조회 실패");
            });
    }

    // =========================
    // 게시글 수정
    // JWT 토큰 필요
    // =========================
    function fnUpdate() {
        if (!title.trim() || !content.trim()) {
            alert("제목과 내용을 입력하세요.");
            return;
        }

        if (!token) {
            alert("로그인 후 이용 가능합니다.");
            navigate("/");
            return;
        }

        fetch("http://localhost:3010/post/update/" + postId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                title,
                content,
                postType: post.POST_TYPE,
                teamId: post.TEAM_ID
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

    // =========================
    // 게시글 삭제
    // JWT 토큰 필요
    // =========================
    function fnDelete() {
        if (!window.confirm("정말 삭제하시겠습니까?")) {
            return;
        }

        if (!token) {
            alert("로그인 후 이용 가능합니다.");
            navigate("/");
            return;
        }

        fetch("http://localhost:3010/post/delete/" + postId, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + token
            }
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

    // =========================
    // 댓글 목록 조회
    // =========================
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

    // =========================
    // 좋아요 상태 조회
    // =========================
    function fnGetLike() {
        if (!token) {
            return;
        }

        fetch("http://localhost:3010/like/" + postId, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + token
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setLikeCnt(data.info.LIKE_CNT);
                    setIsLiked(data.info.IS_LIKED === "Y");
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    // =========================
    // 좋아요 등록 / 취소
    // =========================
    function fnToggleLike() {
        if (!token) {
            alert("로그인 후 이용 가능합니다.");
            navigate("/");
            return;
        }

        fetch("http://localhost:3010/like/" + postId, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
            }
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);

                if (data.success) {
                    fnGetLike();
                    fnGetPost();
                }
            })
            .catch(err => {
                console.log(err);
                alert("좋아요 처리 실패");
            });
    }

    // =========================
    // 댓글 등록
    // =========================
    function fnAddComment() {
        if (!token) {
            alert("로그인 후 이용 가능합니다.");
            navigate("/");
            return;
        }

        if (!comment.trim()) {
            alert("댓글을 입력하세요.");
            return;
        }

        fetch("http://localhost:3010/comment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                postId,
                content: comment
            })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);

                if (data.result || data.success) {
                    setComment("");
                    fnGetCommentList();
                }
            })
            .catch(err => {
                console.log(err);
                alert("댓글 등록 실패");
            });
    }

    // =========================
    // 댓글 삭제
    // =========================
    function fnDeleteComment(commentId) {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) {
            return;
        }

        fetch("http://localhost:3010/comment/" + commentId, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + token
            }
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                fnGetCommentList();
            })
            .catch(err => {
                console.log(err);
                alert("댓글 삭제 실패");
            });
    }

    // 날짜 포맷
    function fnDateFormat(date) {
        return new Date(date).toLocaleString("ko-KR");
    }

    // 화면 처음 열릴 때 실행
    useEffect(() => {
        fnGetPost();
        fnGetCommentList();
        fnGetLike();
    }, [postId]);

    return (
        <div className="post-view-container">
            {isEdit ? (
                <input
                    className="post-title-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            ) : (
                <h2 className="post-title">{post.TITLE}</h2>
            )}

            <div className="post-info-row">
                <span>작성자 : {post.USER_ID}</span>
                <span>조회수 : {post.VIEW_CNT}</span>
            </div>

            <div className="post-stats">
                <span>❤️ {likeCnt}</span>
                <span>💬 {commentList.length}</span>
                <span>👀 {post.VIEW_CNT}</span>
            </div>

            <div className="post-info">
                작성일 : {post.CDATETIME && fnDateFormat(post.CDATETIME)}
            </div>

            {images.length > 0 && (
                <div className="post-image-area">
                    {images.map(img => (
                        <img
                            key={img.IMG_ID}
                            src={"http://localhost:3010" + img.IMG_PATH}
                            alt="게시글 이미지"
                            className="post-detail-image"
                        />
                    ))}
                </div>
            )}

            {isEdit ? (
                <textarea
                    className="post-edit-textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            ) : (
                <div className="post-content">
                    {post.CONTENT}
                </div>
            )}

            <div className="post-action-area">
                <button
                    className={isLiked ? "like-btn" : "like-btn unlike"}
                    onClick={fnToggleLike}
                >
                    {isLiked ? "❤️" : "🤍"} 좋아요 {likeCnt}
                </button>

                {currentUser?.userId === post.USER_ID && (
                    <>
                        {isEdit ? (
                            <button className="update-btn" onClick={fnUpdate}>
                                수정완료
                            </button>
                        ) : (
                            <button
                                className="update-btn"
                                onClick={() => setIsEdit(true)}
                            >
                                수정
                            </button>
                        )}

                        <button className="delete-btn" onClick={fnDelete}>
                            삭제
                        </button>
                    </>
                )}

                <button className="list-btn" onClick={() => navigate("/feed")}>
                    목록으로
                </button>
            </div>

            <hr />

            <h3 className="section-title">댓글</h3>

            <div className="comment-input-box">
                <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="댓글을 입력하세요"
                />

                <button className="insert-btn" onClick={fnAddComment}>
                    등록
                </button>
            </div>

            <h3>댓글 {commentList.length}개</h3>

            {commentList.length === 0 ? (
                <div className="empty-box">아직 댓글이 없습니다.</div>
            ) : (
                commentList.map(item => (
                    <div key={item.COMMENT_ID} className="comment-card">
                        <div className="comment-header">
                            <strong>{item.NICKNAME}</strong>
                            <small>{item.CDATETIME}</small>
                        </div>

                        <div className="comment-content">
                            {item.CONTENT}
                        </div>

                        {currentUser?.userId === item.USER_ID && (
                            <button
                                className="comment-delete-btn"
                                onClick={() => fnDeleteComment(item.COMMENT_ID)}
                            >
                                삭제
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default PostView;