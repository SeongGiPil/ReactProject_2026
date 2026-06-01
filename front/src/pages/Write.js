import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Write() {

    // 페이지 이동 객체
    const navigate = useNavigate();

    // 제목 상태값
    const [title, setTitle] = useState("");

    // 내용 상태값
    const [content, setContent] = useState("");

    // 게시글 유형 상태값
    // FREE / CHEER / INFO / REVIEW
    const [postType, setPostType] = useState("FREE");

    // 게시글 등록 함수
    function fnWrite() {

        // 제목/내용 입력 체크
        if (!title || !content) {
            alert("제목과 내용을 입력하세요.");
            return;
        }

        // 로그인한 사용자 정보 가져오기
        const user = JSON.parse(localStorage.getItem("user"));

        // 로그인 정보가 없을 경우
        if (!user) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        // 게시글 등록 API 호출
        fetch("http://localhost:3010/post/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: user.USER_ID,
                title: title,
                content: content,
                postType: postType
            })
        })
            .then(res => res.json())
            .then(data => {

                console.log(data);

                if (data.success) {
                    alert("게시글이 등록되었습니다.");

                    // 등록 후 게시글 목록으로 이동
                    navigate("/feed");
                } else {
                    alert(data.message);
                }

            })
            .catch(err => {
                console.log(err);
                alert("게시글 등록 실패");
            });

    }

    return (
        <div
            style={{
                width: "700px",
                margin: "30px auto",
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "30px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)"
            }}
        >
            {/* 제목 */}
            <h2
                style={{
                    textAlign: "center",
                    marginBottom: "20px"
                }}
            >
                게시글 작성
            </h2>

            {/* 게시글 유형 선택 */}
            <select
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
                style={{
                    width: "100%",
                    height: "40px",
                    marginBottom: "15px",
                    padding: "0 10px",
                    boxSizing: "border-box"
                }}
            >
                <option value="FREE">자유글</option>
                <option value="CHEER">응원글</option>
                <option value="INFO">정보글</option>
                <option value="REVIEW">후기글</option>
            </select>

            {/* 제목 입력 */}
            <input
                type="text"
                placeholder="제목을 입력하세요."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                    width: "100%",
                    height: "40px",
                    marginBottom: "15px",
                    padding: "0 10px",
                    boxSizing: "border-box"
                }}
            />

            {/* 내용 입력 */}
            <textarea
                placeholder="내용을 입력하세요."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                    width: "100%",
                    height: "250px",
                    marginBottom: "15px",
                    padding: "10px",
                    boxSizing: "border-box",
                    resize: "none"
                }}
            />

            {/* 등록 버튼 */}
            <button
                onClick={fnWrite}
                style={{
                    width: "100%",
                    height: "45px",
                    backgroundColor: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px"
                }}
            >
                등록하기
            </button>
        </div>
    );
}

export default Write;