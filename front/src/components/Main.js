import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Main() {
    const navigate = useNavigate();

    // DB TEAM 테이블 기준
    const teams = [
        { id: 1, name: "LG", icon: "⚡" },
        { id: 2, name: "두산", icon: "🐻" },
        { id: 3, name: "SSG", icon: "🚀" },
        { id: 4, name: "KIA", icon: "🐯" },
        { id: 5, name: "삼성", icon: "🦁" },
        { id: 6, name: "롯데", icon: "⚓" },
        { id: 7, name: "한화", icon: "🦅" },
        { id: 8, name: "KT", icon: "🧙" },
        { id: 9, name: "NC", icon: "🦖" },
        { id: 10, name: "키움", icon: "🦸" }
    ];

    return (
        <div style={pageStyle}>
            <div style={ballStyle1}>⚾</div>
            <div style={ballStyle2}>⚾</div>
            <div style={ballStyle3}>⚾</div>

            <div style={heroStyle}>
                <div style={logoBallStyle}>⚾</div>

                <h1 style={titleStyle}>
                    SpoTalk
                </h1>

                <p style={subTitleStyle}>
                    야구 팬들의 소통 공간
                </p>

                <div style={buttonBoxStyle}>
                    <Link to="/write" style={primaryBtnStyle}>
                        ✏️ 글쓰기
                    </Link>

                    <Link to="/feed" style={whiteBtnStyle}>
                        ☰ 통합게시판
                    </Link>
                </div>
            </div>

            <div style={teamSectionStyle}>
                <h3 style={sectionTitleStyle}>
                    ⚾ 팀 게시판 바로가기 💙
                </h3>

                <div style={teamGridStyle}>
                    {teams.map(team => (
                        <div
                            key={team.id}
                            style={teamCardStyle}
                            onClick={() => navigate("/team/" + team.id)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                    "translateY(-5px)";

                                e.currentTarget.style.boxShadow =
                                    "0 12px 25px rgba(74,140,255,0.25)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                    "translateY(0)";

                                e.currentTarget.style.boxShadow =
                                    "0 6px 15px rgba(0,0,0,0.08)";
                            }}
                        >
                            <div style={teamIconStyle}>
                                {team.icon}
                            </div>

                            <div style={teamNameStyle}>
                                {team.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={postSectionStyle}>
                <div style={postHeaderStyle}>
                    <h3 style={{ margin: 0 }}>
                        🔥 오늘의 인기글
                    </h3>

                    <Link to="/feed" style={moreStyle}>
                        더보기 〉
                    </Link>
                </div>

                <div style={postItemStyle}>
                    ⚾ 짜릿한 끝내기 역전승! 오늘 경기 직관 후기
                    <span>💙 128</span>
                </div>

                <div style={postItemStyle}>
                    🏆 올해 우승은 우리팀이다!!
                    <span>💙 96</span>
                </div>

                <div style={postItemStyle}>
                    📣 선발 라인업 분석 및 경기 전망
                    <span>💙 75</span>
                </div>
            </div>
        </div>
    );
}

const pageStyle = {
    minHeight: "100vh",
    background:
        "linear-gradient(180deg, #BFEAFF 0%, #EAF8FF 60%, #D6F4FF 100%)",
    color: "#17406F",
    padding: "20px 30px",
    position: "relative",
    overflow: "hidden"
};

const ballStyle1 = {
    position: "absolute",
    top: "45px",
    left: "60px",
    fontSize: "55px",
    opacity: 0.65
};

const ballStyle2 = {
    position: "absolute",
    top: "150px",
    right: "80px",
    fontSize: "70px",
    opacity: 0.55
};

const ballStyle3 = {
    position: "absolute",
    bottom: "80px",
    left: "90px",
    fontSize: "60px",
    opacity: 0.45
};

const heroStyle = {
    textAlign: "center",
    paddingTop: "0px",
    paddingBottom: "20px",
    position: "relative",
    zIndex: 1
};

const logoBallStyle = {
    fontSize: "42px"
};

const titleStyle = {
    fontSize: "65px",
    margin: "0",
    color: "#ffffff",
    WebkitTextStroke: "2px #3E7DDA",
    textShadow: "0 7px 0 rgba(59,125,218,0.25)"
};

const subTitleStyle = {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#3E7DDA",
    marginTop: "8px"
};

const buttonBoxStyle = {
    marginTop: "22px",
    display: "flex",
    justifyContent: "center",
    gap: "18px"
};

const primaryBtnStyle = {
    width: "170px",
    padding: "14px 0",
    borderRadius: "14px",
    background: "#4A8CFF",
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
    boxShadow: "0 6px 15px rgba(74,140,255,0.35)"
};

const whiteBtnStyle = {
    width: "170px",
    padding: "14px 0",
    borderRadius: "14px",
    background: "white",
    color: "#3E7DDA",
    textDecoration: "none",
    fontWeight: "bold",
    boxShadow: "0 6px 15px rgba(74,140,255,0.18)"
};

const teamSectionStyle = {
    width: "95%",
    maxWidth: "1200px",
    margin: "25px auto 20px",
    background: "rgba(255,255,255,0.65)",
    borderRadius: "24px",
    padding: "25px",
    boxShadow: "0 10px 30px rgba(74,140,255,0.18)",
    position: "relative",
    zIndex: 1
};

const sectionTitleStyle = {
    marginTop: 0,
    marginBottom: "20px",
    color: "#2D6CCB",
    fontSize: "22px"
};

const teamGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(5, 180px)",
    justifyContent: "center",
    gap: "18px"
};

const teamCardStyle = {
    background: "rgba(255,255,255,0.9)",
    borderRadius: "18px",
    padding: "18px 10px",
    height: "130px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)"
};

const teamIconStyle = {
    fontSize: "45px",
    marginBottom: "10px"
};

const teamNameStyle = {
    fontWeight: "bold",
    color: "#173C70",
    fontSize: "16px"
};

const postSectionStyle = {
    width: "95%",
    maxWidth: "1200px",
    margin: "20px auto",
    background: "rgba(255,255,255,0.7)",
    borderRadius: "24px",
    padding: "25px",
    boxShadow: "0 10px 30px rgba(74,140,255,0.18)",
    position: "relative",
    zIndex: 1
};

const postHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px"
};

const moreStyle = {
    textDecoration: "none",
    color: "#3E7DDA",
    fontWeight: "bold"
};

const postItemStyle = {
    background: "rgba(255,255,255,0.9)",
    padding: "13px 18px",
    borderRadius: "18px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "15px"
};

export default Main;