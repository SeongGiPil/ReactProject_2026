import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function PostView() {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState({});
    const [images, setImages] = useState([]);

    const [isEdit, setIsEdit] = useState(false);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const [commentList, setCommentList] = useState([]);
    const [comment, setComment] = useState("");

    const [likeCnt, setLikeCnt] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

    const token = localStorage.getItem("token");
    const currentUser = token ? jwtDecode(token) : null;

    function fnGetPost() {
        fetch("http://localhost:3010/post/view/" + postId)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPost(data.info);
                    setTitle(data.info.TITLE);
                    setContent(data.info.CONTENT);

                    // 상세보기 이미지 목록
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
            })
            .catch(err => {
                console.log(err);
            });
    }

    function fnLike() {
        fetch("http://localhost:3010/like", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                postId
            })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                fnGetLike();
            })
            .catch(err => {
                console.log(err);
                alert("좋아요 실패");
            });
    }

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
            })
            .catch(err => {
                console.log(err);
                alert("좋아요 취소 실패");
            });
    }

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
            })
            .catch(err => {
                console.log(err);
                alert("댓글 등록 실패");
            });
    }

    function fnDeleteComment(commentId) {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) {
            return;
        }

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
            })
            .catch(err => {
                console.log(err);
                alert("댓글 삭제 실패");
            });
    }

    function fnDateFormat(date) {
        return new Date(date).toLocaleString("ko-KR");
    }

    useEffect(() => {
        fnGetPost();
        fnGetCommentList();
        fnGetLike();
    }, []);

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

                <span>
                    💬 {commentList.length}
                </span>

                <span>
                    👀 {post.VIEW_CNT}
                </span>

            </div>


            <div className="post-info">
                작성일 : {post.CDATETIME && fnDateFormat(post.CDATETIME)}
            </div>

            {/* 상세보기 이미지 */}
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
                    onClick={isLiked ? fnUnlike : fnLike}
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