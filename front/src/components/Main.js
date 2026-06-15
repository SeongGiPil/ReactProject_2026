import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Main() {
    const navigate = useNavigate();

    const [popularPostList, setPopularPostList] = useState([]);
    const [popularTeamList, setPopularTeamList] = useState([]);
    const [bannerIndex, setBannerIndex] = useState(0);

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
    const banners = [
        {
            title: "🎟️ KBO 티켓 예매 바로가기",
            text: "두산·키움은 인터파크, 나머지 구단은 티켓링크에서 예매 가능합니다.",
            button: "티켓 예매하기",
            link: "https://www.ticketlink.co.kr/sports",
            external: true
        },
        {
            title: "🐻 두산 · 🦸 키움 팬 주목!",
            text: "두산 베어스와 키움 히어로즈 경기는 인터파크 티켓에서 예매하세요.",
            button: "인터파크 이동",
            link: "https://ticket.interpark.com/Contents/Sports/Bridge/baseball",
            external: true
        },
        {
            title: "⚾ SpoTalk X KBO",
            text: "응원팀 게시판에서 소통하고 경기 티켓까지 한 번에 예매해보세요.",
            button: "예매 바로가기",
            link: "https://www.ticketlink.co.kr/sports",
            external: true
        }
    ];
    function getTeamInfo(teamId) {
        return teams.find(team => team.id === Number(teamId)) || {
            id: 0,
            name: "통합",
            icon: "⚾"
        };
    }

    function fnGetMainData() {
        fetch("http://192.168.30.76:3010/post/popular")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPopularPostList(data.list || []);
                }
            })
            .catch(err => console.log(err));
    }

    function fnGetTeamRank() {
        fetch("http://192.168.30.76:3010/post/team-rank")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const list = (data.list || []).map(item => {
                        const teamInfo = getTeamInfo(item.TEAM_ID);

                        return {
                            teamId: item.TEAM_ID,
                            name: item.TEAM_NAME,
                            icon: teamInfo.icon,
                            count: item.POST_CNT
                        };
                    });

                    setPopularTeamList(list);
                }
            })
            .catch(err => console.log(err));
    }

    useEffect(() => {
        fnGetMainData();
        fnGetTeamRank();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setBannerIndex(prev =>
                prev === banners.length - 1 ? 0 : prev + 1
            );
        }, 3000);

        return () => clearInterval(timer);
    }, [banners.length]);

    const currentBanner = banners[bannerIndex];

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
                    <Link to="/write" style={primaryBtnStyle}>
                        ✏️ 글쓰기
                    </Link>

                    <Link to="/feed" style={whiteBtnStyle}>
                        ☰ 통합게시판
                    </Link>
                </div>
            </div>

            <div style={bannerStyle}>
                <div>
                    <h2 style={{ margin: 0 }}>{currentBanner.title}</h2>

                    <p style={{ marginTop: "10px", marginBottom: 0 }}>
                        {currentBanner.text}
                    </p>
                </div>

                {currentBanner.external ? (
                    <button
                        onClick={() => window.open(currentBanner.link, "_blank")}
                        style={bannerBtnStyle}
                    >
                        {currentBanner.button} →
                    </button>
                ) : (
                    <Link to={currentBanner.link} style={bannerBtnStyle}>
                        {currentBanner.button} →
                    </Link>
                )}
            </div>

            <div style={bannerDotBoxStyle}>
                {banners.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => setBannerIndex(idx)}
                        style={{
                            ...bannerDotStyle,
                            background:
                                bannerIndex === idx
                                    ? "#4A8CFF"
                                    : "#ffffff"
                        }}
                    />
                ))}
            </div>

            <div style={teamSectionStyle}>
                <h3 style={sectionTitleStyle}>⚾ 팀 게시판 바로가기 💙</h3>

                <div style={teamGridStyle}>
                    {teams.map(team => (
                        <div
                            key={team.id}
                            style={teamCardStyle}
                            onClick={() => navigate("/team/" + team.id)}
                        >
                            <div style={teamIconStyle}>{team.icon}</div>
                            <div style={teamNameStyle}>{team.name}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={rankSectionStyle}>
                <div style={rankCardStyle}>
                    <h3 style={rankTitleStyle}>🏆 인기팀 TOP3</h3>

                    {popularTeamList.length === 0 ? (
                        <div style={postItemStyle}>
                            팀 게시글이 없습니다.
                            <span>0개</span>
                        </div>
                    ) : (
                        popularTeamList.map((team, idx) => (
                            <div
                                key={team.teamId}
                                style={postItemStyle}
                                onClick={() => navigate("/team/" + team.teamId)}
                            >
                                <span>
                                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}{" "}
                                    {team.icon} {team.name}
                                </span>
                                <span>{team.count}개</span>
                            </div>
                        ))
                    )}
                </div>

                <div style={rankCardStyle}>
                    <div style={postHeaderStyle}>
                        <h3 style={{ margin: 0 }}>🔥 인기글 TOP5</h3>

                        <Link to="/feed" style={moreStyle}>
                            더보기 〉
                        </Link>
                    </div>

                    {popularPostList.length === 0 ? (
                        <div style={postItemStyle}>
                            아직 게시글이 없습니다.
                            <span>💙 0</span>
                        </div>
                    ) : (
                        popularPostList.map((item, idx) => (
                            <Link
                                key={item.POST_ID}
                                to={"/post/" + item.POST_ID}
                                style={{
                                    ...postItemStyle,
                                    textDecoration: "none",
                                    color: "#17406F"
                                }}
                            >
                                <span>
                                    {idx + 1}. {item.TITLE}{" "}
                                    <span style={{ color: "#1976d2" }}>
                                        [{item.COMMENT_CNT || 0}]
                                    </span>
                                </span>

                                <span>💙 {item.LIKE_CNT}</span>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

const pageStyle = {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #BFEAFF 0%, #EAF8FF 60%, #D6F4FF 100%)",
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

const bannerStyle = {
    width: "95%",
    maxWidth: "1200px",
    height: "170px",
    margin: "20px auto 8px",
    color: "white",
    borderRadius: "24px",
    padding: "25px 35px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 10px 25px rgba(74,140,255,0.25)",
    position: "relative",
    zIndex: 1,
    background: "linear-gradient(90deg,#4A8CFF,#79B8FF)"
};

const bannerBtnStyle = {
    background: "white",
    color: "#4A8CFF",
    padding: "12px 20px",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    fontSize: "15px"
};

const bannerDotBoxStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "16px",
    position: "relative",
    zIndex: 1
};

const bannerDotStyle = {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    border: "1px solid #4A8CFF",
    cursor: "pointer"
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

const rankSectionStyle = {
    width: "95%",
    maxWidth: "1200px",
    margin: "20px auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    position: "relative",
    zIndex: 1
};

const rankCardStyle = {
    background: "rgba(255,255,255,0.7)",
    borderRadius: "24px",
    padding: "25px",
    boxShadow: "0 10px 30px rgba(74,140,255,0.18)"
};

const rankTitleStyle = {
    marginTop: 0,
    marginBottom: "16px"
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
    fontSize: "15px",
    cursor: "pointer"
};

export default Main;