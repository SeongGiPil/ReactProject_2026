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

    const [followInfo, setFollowInfo] = useState({
        isFollowing: "N",
        followerCnt: 0,
        followingCnt: 0
    });

    const token = localStorage.getItem("token");
    const currentUser = token ? jwtDecode(token) : null;

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

    function fnGetPost() {
        fetch("http://192.168.30.76:3010/post/view/" + postId)
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

    function fnUpdate() {
        if (!title.trim() || !content.trim()) {
            alert("제목과 내용을 입력하세요.");
            return;
        }

        fetch("http://192.168.30.76:3010/post/update/" + postId, {
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

    function fnDelete() {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        fetch("http://192.168.30.76:3010/post/delete/" + postId, {
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

    function fnReport() {
        if (!token) {
            alert("로그인 후 이용 가능합니다.");
            return;
        }

        const reason = prompt(
            "신고 사유를 입력하세요.\n\n욕설\n광고\n도배\n부적절한 내용\n기타"
        );

        if (!reason) return;

        fetch("http://192.168.30.76:3010/report", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                targetType: "POST",
                targetId: postId,
                reason
            })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
            })
            .catch(err => {
                console.log(err);
                alert("신고 실패");
            });
    }

    function fnGetCommentList() {
        fetch("http://192.168.30.76:3010/comment/" + postId)
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
        if (!token) return;

        fetch("http://192.168.30.76:3010/like/" + postId, {
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
            .catch(err => console.log(err));
    }

    function fnGetFollowInfo() {
        if (!token || !post.USER_ID) return;

        fetch("http://192.168.30.76:3010/follow/" + post.USER_ID, {
            headers: {
                Authorization: "Bearer " + token
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setFollowInfo(data.info);
                }
            })
            .catch(err => console.log(err));
    }

    function fnToggleFollow() {
        if (!token) {
            alert("로그인 후 이용 가능합니다.");
            navigate("/");
            return;
        }

        fetch("http://192.168.30.76:3010/follow/" + post.USER_ID, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
            }
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);

                if (data.success) {
                    fnGetFollowInfo();
                }
            })
            .catch(err => {
                console.log(err);
                alert("팔로우 처리 실패");
            });
    }

    function fnToggleLike() {
        if (!token) {
            alert("로그인 후 이용 가능합니다.");
            navigate("/");
            return;
        }

        fetch("http://192.168.30.76:3010/like/" + postId, {
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

        fetch("http://192.168.30.76:3010/comment", {
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

    function fnDeleteComment(commentId) {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

        fetch("http://192.168.30.76:3010/comment/" + commentId, {
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

    function fnDateFormat(date) {
        return new Date(date).toLocaleString("ko-KR");
    }

    useEffect(() => {
        fnGetPost();
        fnGetCommentList();
        fnGetLike();
    }, [postId]);

    useEffect(() => {
        if (post.USER_ID) {
            fnGetFollowInfo();
        }
    }, [post.USER_ID]);

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
                {post.USER_ID && currentUser?.userId !== post.USER_ID && (
                    <button
                        className="list-btn"
                        onClick={() => navigate("/user/" + post.USER_ID)}
                    >
                        프로필
                    </button>
                )}
                <span>조회수 : {post.VIEW_CNT}</span>
            </div>

            {currentUser?.userId !== post.USER_ID && (
                <div
                    style={{
                        marginTop: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    }}
                >
                    <button
                        onClick={fnToggleFollow}
                        style={{
                            padding: "6px 12px",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            background:
                                followInfo.isFollowing === "Y"
                                    ? "#ff5722"
                                    : "#2196f3",
                            color: "white"
                        }}
                    >
                        {followInfo.isFollowing === "Y"
                            ? "언팔로우"
                            : "팔로우"}
                    </button>

                    <span>팔로워 {followInfo.followerCnt}</span>
                    <span>팔로잉 {followInfo.followingCnt}</span>
                </div>
            )}

            <div
                style={{
                    marginTop: "8px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#ff9800"
                }}
            >
                {getTeamIcon(post.WRITER_TEAM_NAME)}{" "}
                {post.WRITER_TEAM_NAME || "통합"} {getFanGrade(post)}
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
                            src={"http://192.168.30.76:3010" + img.IMG_PATH}
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
                <div className="post-content">{post.CONTENT}</div>
            )}

            <div className="post-action-area">

                {currentUser?.userId !== post.USER_ID && (
                    <>
                        <button
                            className={isLiked ? "like-btn" : "like-btn unlike"}
                            onClick={fnToggleLike}
                        >
                            {isLiked ? "❤️" : "🤍"} 좋아요 {likeCnt}
                        </button>

                        <button
                            className="report-btn"
                            onClick={fnReport}
                        >
                            🚨 신고
                        </button>
                    </>
                )}

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

                        <button
                            className="delete-btn"
                            onClick={fnDelete}
                        >
                            삭제
                        </button>
                    </>
                )}

                <button
                    className="list-btn"
                    onClick={() => navigate("/feed")}
                >
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
                            <div>
                                <strong>{item.NICKNAME}</strong>

                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: "#ff9800",
                                        fontWeight: "bold",
                                        marginTop: "3px"
                                    }}
                                >
                                    {getTeamIcon(item.WRITER_TEAM_NAME)}{" "}
                                    {item.WRITER_TEAM_NAME || "통합"}{" "}
                                    {getFanGrade(item)}
                                </div>
                            </div>

                            <small>{item.CDATETIME}</small>
                        </div>

                        <div className="comment-content">{item.CONTENT}</div>

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