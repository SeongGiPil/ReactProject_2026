import React from "react";
import { Link } from "react-router-dom";

function Main() {
    const teams = [
        { name: "두산", icon: "🐻" },
        { name: "삼성", icon: "🦁" },
        { name: "KIA", icon: "🐯" },
        { name: "한화", icon: "🦅" },
        { name: "SSG", icon: "🚀" },
        { name: "NC", icon: "🦖" },
        { name: "키움", icon: "🦄" },
        { name: "KT", icon: "🧙" },
        { name: "롯데", icon: "🌊" },
        { name: "LG", icon: "⭐" }
    ];

    return (
        <div style={pageStyle}>
            <div style={ballStyle1}>⚾</div>
            <div style={ballStyle2}>⚾</div>
            <div style={ballStyle3}>⚾</div>

            <div style={heroStyle}>
                <div style={logoBallStyle}>⚾</div>
                <h1 style={titleStyle}>SpoTalk</h1>
                <p style={subTitleStyle}>야구 팬들의 소통 공간</p>

                <div style={buttonBoxStyle}>
                    <Link to="/write" style={primaryBtnStyle}>✏️ 글쓰기</Link>
                    <Link to="/feed" style={whiteBtnStyle}>☰ 게시글 보기</Link>
                </div>
            </div>

            <div style={teamSectionStyle}>
                <h3 style={sectionTitleStyle}>⚾ 응원하는 팀 선택 💙</h3>

                <div style={teamGridStyle}>
                    {teams.map(team => (
                        <div key={team.name} style={teamCardStyle}>
                            <div style={teamIconStyle}>{team.icon}</div>
                            <div style={teamNameStyle}>{team.name}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={postSectionStyle}>
                <div style={postHeaderStyle}>
                    <h3 style={{ margin: 0 }}>🔥 오늘의 인기글</h3>
                    <Link to="/feed" style={moreStyle}>더보기 〉</Link>
                </div>

                <div style={postItemStyle}>⚾ 짜릿한 끝내기 역전승! 오늘 경기 직관 후기 <span>💙 128</span></div>
                <div style={postItemStyle}>🏆 올해 우승은 우리팀이다!! <span>💙 96</span></div>
                <div style={postItemStyle}>📣 선발 라인업 분석 및 경기 전망 <span>💙 75</span></div>
            </div>
        </div>
    );
}

const pageStyle = {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #BFEAFF 0%, #EAF8FF 60%, #D6F4FF 100%)",
    color: "#17406F",
    padding: "50px",
    position: "relative",
    overflow: "hidden"
};

const ballStyle1 = {
    position: "absolute",
    top: "70px",
    left: "80px",
    fontSize: "70px",
    opacity: 0.8
};

const ballStyle2 = {
    position: "absolute",
    top: "180px",
    right: "120px",
    fontSize: "90px",
    opacity: 0.75
};

const ballStyle3 = {
    position: "absolute",
    bottom: "90px",
    left: "120px",
    fontSize: "80px",
    opacity: 0.65
};

const heroStyle = {
    textAlign: "center",
    paddingTop: "30px",
    position: "relative",
    zIndex: 1
};

const logoBallStyle = {
    fontSize: "42px"
};

const titleStyle = {
    fontSize: "64px",
    margin: "0",
    color: "#ffffff",
    WebkitTextStroke: "2px #3E7DDA",
    textShadow: "0 6px 0 rgba(59,125,218,0.25)"
};

const subTitleStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#3E7DDA",
    marginTop: "10px"
};

const buttonBoxStyle = {
    marginTop: "25px",
    display: "flex",
    justifyContent: "center",
    gap: "20px"
};

const primaryBtnStyle = {
    width: "180px",
    padding: "15px 0",
    borderRadius: "14px",
    background: "#4A8CFF",
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
    boxShadow: "0 6px 15px rgba(74,140,255,0.35)"
};

const whiteBtnStyle = {
    width: "180px",
    padding: "15px 0",
    borderRadius: "14px",
    background: "white",
    color: "#3E7DDA",
    textDecoration: "none",
    fontWeight: "bold",
    boxShadow: "0 6px 15px rgba(74,140,255,0.18)"
};

const teamSectionStyle = {
    width: "760px",
    margin: "35px auto 20px",
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
    color: "#2D6CCB"
};

const teamGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "15px"
};

const teamCardStyle = {
    background: "rgba(255,255,255,0.9)",
    borderRadius: "18px",
    padding: "18px 10px",
    textAlign: "center",
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)"
};

const teamIconStyle = {
    fontSize: "46px",
    marginBottom: "8px"
};

const teamNameStyle = {
    fontWeight: "bold",
    color: "#173C70"
};

const postSectionStyle = {
    width: "760px",
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
    marginBottom: "15px"
};

const moreStyle = {
    textDecoration: "none",
    color: "#3E7DDA",
    fontWeight: "bold"
};

const postItemStyle = {
    background: "rgba(255,255,255,0.9)",
    padding: "12px 18px",
    borderRadius: "20px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between"
};

export default Main;