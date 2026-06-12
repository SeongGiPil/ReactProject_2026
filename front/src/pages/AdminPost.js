import React, { useEffect, useState } from "react";

function AdminPost() {
    const [postList, setPostList] = useState([]);

    // 게시글 목록 조회
    function fnGetPostList() {
        fetch("http://localhost:3010/admin/post/list")
            .then(res => res.json())
            .then(data => {
                console.log("관리자 게시글 목록 :", data);

                if (data.success) {
                    setPostList(data.list || []);
                }
            })
            .catch(err => {
                console.log(err);
                alert("게시글 목록 조회 실패");
            });
    }

    // 게시글 삭제 처리
    function fnDeletePost(postId) {
        if (!window.confirm("해당 게시글을 삭제 처리하시겠습니까?")) {
            return;
        }

        fetch("http://localhost:3010/admin/post/" + postId, {
            method: "DELETE"
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);

                if (data.success) {
                    fnGetPostList();
                }
            })
            .catch(err => {
                console.log(err);
                alert("게시글 삭제 처리 실패");
            });
    }

    // 게시글 상태 한글 변환
    function fnStatusName(status) {
        if (status === "NORMAL") return "정상";
        if (status === "DEL") return "삭제";
        return status;
    }

    // 게시글 타입 한글 변환
    function fnTypeName(type) {
        if (type === "FREE") return "자유글";
        if (type === "CHEER") return "응원글";
        if (type === "INFO") return "정보글";
        if (type === "REVIEW") return "후기글";
        return type;
    }

    useEffect(() => {
        fnGetPostList();
    }, []);

    return (
        <div className="mypage-container">
            <h2 className="page-title">
                📝 게시글 관리
            </h2>

            <div className="mypage-card">
                <h3 className="section-title">
                    전체 게시글 목록
                </h3>

                <table>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>작성자</th>
                            <th>유형</th>
                            <th>제목</th>
                            <th>댓글</th>
                            <th>좋아요</th>
                            <th>조회수</th>
                            <th>상태</th>
                            <th>작성일</th>
                            <th>관리</th>
                        </tr>
                    </thead>

                    <tbody>
                        {postList.length === 0 ? (
                            <tr>
                                <td colSpan="10">
                                    게시글이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            postList.map(item => (
                                <tr key={item.POST_ID}>
                                    <td>{item.POST_ID}</td>
                                    <td>{item.USER_ID}</td>
                                    <td>{fnTypeName(item.POST_TYPE)}</td>
                                    <td>{item.TITLE}</td>
                                    <td>{item.COMMENT_CNT || 0}</td>
                                    <td>{item.LIKE_CNT || 0}</td>
                                    <td>{item.VIEW_CNT || 0}</td>
                                    <td>{fnStatusName(item.POST_STATUS)}</td>
                                    <td>{item.CDATETIME}</td>
                                    <td>
                                        {item.POST_STATUS === "NORMAL" ? (
                                            <button
                                                className="delete-btn"
                                                onClick={() =>
                                                    fnDeletePost(item.POST_ID)
                                                }
                                            >
                                                삭제처리
                                            </button>
                                        ) : (
                                            <span>처리됨</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminPost;