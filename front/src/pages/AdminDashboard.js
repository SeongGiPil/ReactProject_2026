import React, { useEffect, useState } from "react";

function AdminDashboard() {
    const [info, setInfo] = useState({
        USER_CNT: 0,
        POST_CNT: 0,
        COMMENT_CNT: 0,
        REPORT_CNT: 0,
        ATTEND_CNT: 0
    });

    function fnGetDashboard() {
        fetch("http://192.168.30.76.3010/admin/dashboard")
            .then(res => res.json())
            .then(data => {
                console.log("관리자 대시보드 :", data);

                if (data.success) {
                    setInfo(data.info);
                }
            })
            .catch(err => {
                console.log(err);
                alert("대시보드 조회 실패");
            });
    }

    useEffect(() => {
        fnGetDashboard();
    }, []);

    return (
        <div className="mypage-container">
            <h2 className="page-title">
                📊 관리자 대시보드
            </h2>

            <div className="stats-box">
                <div className="stats-card">
                    <div className="stats-icon">👤</div>
                    <div className="stats-value">{info.USER_CNT}</div>
                    <div className="stats-title">전체 회원</div>
                </div>

                <div className="stats-card">
                    <div className="stats-icon">📝</div>
                    <div className="stats-value">{info.POST_CNT}</div>
                    <div className="stats-title">정상 게시글</div>
                </div>

                <div className="stats-card">
                    <div className="stats-icon">💬</div>
                    <div className="stats-value">{info.COMMENT_CNT}</div>
                    <div className="stats-title">정상 댓글</div>
                </div>

                <div className="stats-card">
                    <div className="stats-icon">🚨</div>
                    <div className="stats-value">{info.REPORT_CNT}</div>
                    <div className="stats-title">신고 건수</div>
                </div>

                <div className="stats-card">
                    <div className="stats-icon">📅</div>
                    <div className="stats-value">{info.ATTEND_CNT}</div>
                    <div className="stats-title">출석 건수</div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;