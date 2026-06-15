import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Notification() {
    const [list, setList] = useState([]);
    const navigate = useNavigate();

    function getNotificationText(item) {
        if (item.NOTI_TYPE === "FOLLOW") return "👥 새로운 팔로워가 생겼습니다.";
        if (item.NOTI_TYPE === "LIKE") return "❤️ 내 게시글에 좋아요가 눌렸습니다.";
        if (item.NOTI_TYPE === "COMMENT") return "💬 내 게시글에 댓글이 달렸습니다.";
        return "🔔 새 알림이 있습니다.";
    }

    function fnGetList() {
        fetch("http://192.168.30.76:3010/notification", {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) setList(data.list || []);
            })
            .catch(err => {
                console.log(err);
                alert("알림 조회 실패");
            });
    }

    function fnRead(notiId) {
        fetch("http://192.168.30.76:3010/notification/read/" + notiId, {
            method: "PUT",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) fnGetList();
            })
            .catch(err => {
                console.log(err);
                alert("읽음 처리 실패");
            });
    }

    function fnMoveNotification(item) {
        if (item.IS_READ === "N") {
            fnRead(item.NOTI_ID);
        }

        if (item.NOTI_TYPE === "FOLLOW") {
            navigate("/follow/follower");
            return;
        }

        if (item.NOTI_TYPE === "LIKE" || item.NOTI_TYPE === "COMMENT") {
            if (item.REF_ID) {
                navigate("/post/" + item.REF_ID);
            }
        }
    }

    useEffect(() => {
        fnGetList();
    }, []);

    return (
        <div className="mypage-container">
            <h2 className="page-title">🔔 알림</h2>

            <div className="mypage-card">
                {list.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "#777" }}>
                        알림이 없습니다.
                    </div>
                ) : (
                    list.map(item => (
                        <div
                            key={item.NOTI_ID}
                            onClick={() => fnMoveNotification(item)}
                            style={{
                                padding: "18px",
                                marginBottom: "14px",
                                borderRadius: "16px",
                                background: item.IS_READ === "Y" ? "#f5f5f5" : "#e3f2fd",
                                borderLeft: item.IS_READ === "Y" ? "5px solid #999" : "5px solid #1976d2",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                cursor: "pointer"
                            }}
                        >
                            <div style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "16px" }}>
                                {getNotificationText(item)}
                            </div>

                            <div style={{ fontSize: "13px", color: "#777" }}>
                                {item.CDATETIME}
                            </div>

                            {item.IS_READ === "N" && (
                                <div style={{ marginTop: "8px", fontSize: "12px", color: "#1976d2" }}>
                                    클릭하면 읽음 처리됩니다.
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Notification;