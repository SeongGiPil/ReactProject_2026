import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Write() {

    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [postType, setPostType] = useState("FREE");

    // 게시판 선택
    const [teamId, setTeamId] = useState("");

    // 응원팀 목록
    const [teamList, setTeamList] = useState([]);

    // 로그인 사용자 응원팀 조회
    function fnGetMyTeam() {

        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
            return;
        }

        const userId = user.USER_ID || user.userId;

        fetch(
            "http://localhost:3010/team/my/" + userId
        )
            .then(res => res.json())
            .then(data => {

                if (data.success) {
                    setTeamList(data.list);
                }

            })
            .catch(err => {
                console.log(err);
            });
    }

    useEffect(() => {
        fnGetMyTeam();
    }, []);

    // 게시글 등록
    function fnWrite() {

        if (!title.trim()) {
            alert("제목을 입력하세요.");
            return;
        }

        if (!content.trim()) {
            alert("내용을 입력하세요.");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        const formData = new FormData();

        formData.append(
            "userId",
            user.USER_ID || user.userId
        );

        formData.append("title", title);
        formData.append("content", content);
        formData.append("postType", postType);

        // 통합게시판이면 빈값
        // 팀게시판이면 TEAM_ID
        formData.append("teamId", teamId);

        fetch(
            "http://localhost:3010/post/add",
            {
                method: "POST",
                body: formData
            }
        )
            .then(res => res.json())
            .then(data => {

                if (data.success) {

                    alert("게시글 등록 성공");

                    if (teamId) {
                        navigate("/team/" + teamId);
                    } else {
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

    return (
        <div className="post-view-container">

            <h2 className="page-title">
                게시글 작성
            </h2>

            {/* 게시판 선택 */}
            <div style={{ marginBottom: "15px" }}>
                <label>
                    게시판 선택
                </label>

                <select
                    value={teamId}
                    onChange={(e) => {
                        setTeamId(e.target.value);
                    }}
                    style={{
                        width: "100%",
                        height: "40px"
                    }}
                >
                    <option value="">
                        통합게시판
                    </option>

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

            {/* 게시글 종류 */}
            <div style={{ marginBottom: "15px" }}>
                <label>
                    글 유형
                </label>

                <select
                    value={postType}
                    onChange={(e) => {
                        setPostType(e.target.value);
                    }}
                    style={{
                        width: "100%",
                        height: "40px"
                    }}
                >
                    <option value="FREE">
                        자유글
                    </option>

                    <option value="CHEER">
                        응원글
                    </option>

                    <option value="INFO">
                        정보글
                    </option>

                    <option value="REVIEW">
                        후기글
                    </option>
                </select>
            </div>

            {/* 제목 */}
            <input
                type="text"
                placeholder="제목 입력"
                value={title}
                onChange={(e) => {
                    setTitle(e.target.value);
                }}
                style={{
                    width: "100%",
                    height: "40px",
                    marginBottom: "15px"
                }}
            />

            {/* 내용 */}
            <textarea
                placeholder="내용 입력"
                value={content}
                onChange={(e) => {
                    setContent(e.target.value);
                }}
                style={{
                    width: "100%",
                    height: "250px",
                    resize: "none"
                }}
            />

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