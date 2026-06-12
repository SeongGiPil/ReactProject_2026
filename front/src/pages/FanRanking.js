import React, { useEffect, useState } from "react";

function FanRanking() {
    const [rankingList, setRankingList] = useState([]);

    function fnGetRanking() {
        fetch("http://192.168.30.76.3010/user/ranking/top10")
            .then(res => res.json())
            .then(data => {
                console.log("팬랭킹 :", data);

                if (data.success) {
                    setRankingList(data.list || []);
                }
            })
            .catch(err => {
                console.log(err);
                alert("팬랭킹 조회 실패");
            });
    }

    function getRankIcon(index) {
        if (index === 0) return "🥇";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";
        return index + 1;
    }

    function getFanGrade(score) {
        if (score >= 500) return "MVP Fan 🔥";
        if (score >= 300) return "Gold Fan 🥇";
        if (score >= 150) return "Silver Fan 🥈";
        if (score >= 50) return "Bronze Fan 🥉";
        return "Rookie Fan ⚾";
    }

    useEffect(() => {
        fnGetRanking();
    }, []);

    return (
        <div className="mypage-container">
            <h2 className="page-title">
                🏆 팬랭킹 TOP10
            </h2>

            <div className="mypage-card">
                <h3 className="section-title">
                    SpoTalk 팬 활동 순위
                </h3>

                <table>
                    <thead>
                        <tr>
                            <th>순위</th>
                            <th>프로필</th>
                            <th>닉네임</th>
                            <th>팬등급</th>
                            <th>팬점수</th>
                            <th>게시글</th>
                            <th>댓글</th>
                            <th>받은 좋아요</th>
                            <th>출석포인트</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rankingList.length === 0 ? (
                            <tr>
                                <td colSpan="9">
                                    랭킹 데이터가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            rankingList.map((item, index) => (
                                <tr key={item.USER_ID}>
                                    <td
                                        style={{
                                            fontSize: "22px",
                                            fontWeight: "bold"
                                        }}
                                    >
                                        {getRankIcon(index)}
                                    </td>

                                    <td>
                                        {item.PROFILE_IMG ? (
                                            <img
                                                src={
                                                    "http://192.168.30.76.3010" +
                                                    item.PROFILE_IMG
                                                }
                                                alt="프로필"
                                                style={{
                                                    width: "42px",
                                                    height: "42px",
                                                    borderRadius: "50%",
                                                    objectFit: "cover"
                                                }}
                                            />
                                        ) : (
                                            "👤"
                                        )}
                                    </td>

                                    <td>{item.NICKNAME}</td>
                                    <td>{getFanGrade(item.FAN_SCORE)}</td>
                                    <td>
                                        <strong>{item.FAN_SCORE}</strong>
                                    </td>
                                    <td>{item.POST_CNT}</td>
                                    <td>{item.COMMENT_CNT}</td>
                                    <td>{item.TOTAL_LIKE_CNT}</td>
                                    <td>{item.ATTEND_POINT}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default FanRanking;