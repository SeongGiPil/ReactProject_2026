// React 기본 훅 사용
import React, { useEffect, useState } from "react";

// 페이지 이동용
import { useNavigate } from "react-router-dom";

function Write() {
    // 페이지 이동 함수
    const navigate = useNavigate();

    // =========================
    // 입력값 state
    // =========================

    // 제목
    const [title, setTitle] = useState("");

    // 내용
    const [content, setContent] = useState("");

    // 글 유형
    const [postType, setPostType] = useState("FREE");

    // 팀 게시판 선택값
    // 빈 문자열이면 통합게시판
    const [teamId, setTeamId] = useState("");

    // 내 응원팀 목록
    const [teamList, setTeamList] = useState([]);

    // 업로드할 이미지 파일 목록
    const [images, setImages] = useState([]);

    // 이미지 미리보기 URL 목록
    const [previewList, setPreviewList] = useState([]);

    // =========================
    // 로그인 사용자 응원팀 조회
    // =========================
    function fnGetMyTeam() {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
            return;
        }

        const userId = user.USER_ID || user.userId;

        fetch("http://192.168.30.76:3010/team/my/" + userId)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTeamList(data.list || []);
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    // =========================
    // 이미지 선택
    // 최대 5장까지만 선택 가능
    // =========================
    function fnChangeImages(e) {
        const files = Array.from(e.target.files);

        if (files.length > 5) {
            alert("이미지는 최대 5장까지 업로드 가능합니다.");
            return;
        }

        // 실제 서버로 보낼 이미지 파일 저장
        setImages(files);

        // 화면 미리보기용 URL 생성
        const previews = files.map(file => URL.createObjectURL(file));

        setPreviewList(previews);
    }

    // =========================
    // 이미지 전체 삭제
    // =========================
    function fnClearImages() {
        setImages([]);
        setPreviewList([]);
    }

    // =========================
    // 게시글 등록
    // =========================
    function fnWrite() {
        if (!title.trim()) {
            alert("제목을 입력하세요.");
            return;
        }

        if (!content.trim()) {
            alert("내용을 입력하세요.");
            return;
        }

        // 제목 100자 제한
        if (title.length > 100) {
            alert("제목은 100자 이하로 입력하세요.");
            return;
        }

        // 내용 200자 제한
        if (content.length > 200) {
            alert("내용은 200자 이하로 입력하세요.");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
            alert("로그인이 필요합니다.");
            navigate("/");
            return;
        }

        // 이미지가 포함되므로 FormData 사용
        const formData = new FormData();

        formData.append("userId", user.USER_ID || user.userId);
        formData.append("title", title);
        formData.append("content", content);
        formData.append("postType", postType);
        formData.append("teamId", teamId);

        // 이미지 파일 추가
        for (let i = 0; i < images.length; i++) {
            formData.append("images", images[i]);
        }

        fetch("http://192.168.30.76:3010/post/add", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("게시글 등록 성공");

                    // 팀 게시판 글이면 해당 팀 게시판으로 이동
                    if (teamId) {
                        navigate("/team/" + teamId);
                    } else {
                        // 통합게시판 글이면 피드로 이동
                        navigate("/feed");
                    }

                } else {
                    alert(data.message);
                }
            })
            .catch(err => {
                console.log(err);
                alert("게시글 등록 실패");
            });
    }

    // 화면 처음 열릴 때 내 응원팀 조회
    useEffect(() => {
        fnGetMyTeam();
    }, []);

    return (
        <div className="post-view-container">
            <h2 className="page-title">
                게시글 작성
            </h2>

            {/* 게시판 선택 */}
            <div style={{ marginBottom: "15px" }}>
                <label>게시판 선택</label>

                <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    style={{
                        width: "100%",
                        height: "40px"
                    }}
                >
                    <option value="">통합게시판</option>

                    {teamList.map(item => (
                        <option
                            key={item.TEAM_ID}
                            value={item.TEAM_ID}
                        >
                            {item.TEAM_NAME} 게시판
                        </option>
                    ))}
                </select>
            </div>

            {/* 글 유형 선택 */}
            <div style={{ marginBottom: "15px" }}>
                <label>글 유형</label>

                <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value)}
                    style={{
                        width: "100%",
                        height: "40px"
                    }}
                >
                    <option value="FREE">자유글</option>
                    <option value="CHEER">응원글</option>
                    <option value="INFO">정보글</option>
                    <option value="REVIEW">후기글</option>
                </select>
            </div>

            {/* 제목 입력 */}
            <div style={{ marginBottom: "15px" }}>
                <label>
                    제목 ({title.length}/100)
                </label>

                <input
                    type="text"
                    placeholder="제목 입력"
                    value={title}
                    maxLength={100}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                        width: "100%",
                        height: "40px"
                    }}
                />
            </div>

            {/* 내용 입력 */}
            <div style={{ marginBottom: "15px" }}>
                <label>
                    내용 ({content.length}/200)
                </label>

                <textarea
                    placeholder="내용 입력"
                    value={content}
                    maxLength={200}
                    onChange={(e) => setContent(e.target.value)}
                    style={{
                        width: "100%",
                        height: "250px",
                        resize: "none",
                        borderColor: content.length >= 180 ? "red" : undefined
                    }}
                />

             
            </div>

            {/* 이미지 첨부 */}
            <div style={{ marginBottom: "15px" }}>
                <label>이미지 첨부 최대 5장</label>

                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={fnChangeImages}
                    style={{
                        display: "block",
                        marginTop: "8px"
                    }}
                />

                {/* 이미지 미리보기 */}
                {previewList.length > 0 && (
                    <>
                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                marginTop: "10px",
                                flexWrap: "wrap"
                            }}
                        >
                            {previewList.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt="미리보기"
                                    style={{
                                        width: "120px",
                                        height: "120px",
                                        objectFit: "cover",
                                        borderRadius: "8px"
                                    }}
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={fnClearImages}
                            style={{
                                marginTop: "10px"
                            }}
                        >
                            이미지 전체 삭제
                        </button>
                    </>
                )}
            </div>

            {/* 등록 버튼 */}
            <button
                className="insert-btn"
                style={{
                    width: "100%",
                    marginTop: "20px",
                    height: "45px"
                }}
                onClick={fnWrite}
            >
                등록하기
            </button>
        </div>
    );
}

export default Write;