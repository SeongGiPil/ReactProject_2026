import React, { useEffect, useState } from "react";

function Banner() {

    const bannerList = [
        {
            title: "오늘의 인기 게시글",
            subTitle: "팬들이 가장 많이 본 인기글을 확인해보세요!",
            icon: "🔥",
            bg: "linear-gradient(135deg, #ff9800, #f44336)"
        },
        {
            title: "응원팀을 선택해보세요",
            subTitle: "내 팀을 선택하고 같은 팬들과 소통해보세요!",
            icon: "⚾",
            bg: "linear-gradient(135deg, #1976d2, #42a5f5)"
        },
        {
            title: "실시간 팬 인기차트",
            subTitle: "좋아요와 댓글이 많은 게시글을 만나보세요!",
            icon: "🏆",
            bg: "linear-gradient(135deg, #673ab7, #9c27b0)"
        }
    ];

    const [index, setIndex] = useState(0);

    useEffect(() => {

        const timer = setInterval(() => {
            setIndex(prev => (prev + 1) % bannerList.length);
        }, 3000);

        return () => clearInterval(timer);

    }, []);

    const item = bannerList[index];

    return (
        <div style={{ width: "100%", marginBottom: "25px" }}>

            <div
                style={{
                    height: "190px",
                    borderRadius: "16px",
                    padding: "28px",
                    color: "white",
                    background: item.bg,
                    boxSizing: "border-box",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.18)"
                }}
            >

                <div>

                    <div
                        style={{
                            fontSize: "15px",
                            marginBottom: "8px",
                            opacity: 0.9
                        }}
                    >
                        SpoTalk Banner
                    </div>

                    <h2
                        style={{
                            margin: "0 0 10px 0",
                            fontSize: "28px",
                            fontWeight: "bold"
                        }}
                    >
                        {item.title}
                    </h2>

                    <p
                        style={{
                            margin: 0,
                            fontSize: "16px"
                        }}
                    >
                        {item.subTitle}
                    </p>

                </div>

                <div
                    style={{
                        fontSize: "72px"
                    }}
                >
                    {item.icon}
                </div>

            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "8px",
                    marginTop: "10px"
                }}
            >
                {bannerList.map((_, i) => (
                    <span
                        key={i}
                        onClick={() => setIndex(i)}
                        style={{
                            width: i === index ? "22px" : "8px",
                            height: "8px",
                            borderRadius: "10px",
                            backgroundColor:
                                i === index ? "#1976d2" : "#ccc",
                            cursor: "pointer",
                            transition: "0.3s"
                        }}
                    />
                ))}
            </div>

        </div>
    );
}

export default Banner;