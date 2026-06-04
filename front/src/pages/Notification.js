import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Notification() {
    const [notiList, setNotiList] = useState([]);

    function fnGetNotificationList() {
        fetch("http://localhost:3010/notification/list", {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log("알림 목록 :", data);

                if (data.success) {
                    setNotiList(data.list || []);
                }
            })
            .catch(err => {
                console.log(err);
                alert("알림 조회 실패");
            });
    }

    function fnReadNotification(notiId) {
        fetch("http://localhost:3010/notification/read/" + notiId, {
            method: "PUT",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    fnGetNotificationList();
                }
            })
            .catch(err => console.log(err));
    }

    function fnReadAll() {
        fetch("http://localhost:3010/notification/read-all", {
            method: "PUT",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);

                if (data.success) {
                    fnGetNotificationList();
                }
            })
            .catch(err => console.log(err));
    }

    function getTypeIcon(type) {
        if (type === "COMMENT") return "💬";
        if (type === "LIKE") return "❤️";
        if (type === "REPORT") return "🚨";
        if (type === "REPLY") return "↩️";
        return "🔔";
    }

    useEffect(() => {
        fnGetNotificationList();
    }, []);

    return (
        <div className="mypage-container">
            <h2 className="page-title">
                🔔 알림
            </h2>

            <div className="mypage-card">
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "15px"
                    }}
                >
                    <h3 className="section-title">
                        내 알림 목록
                    </h3>

                    <button
                        className="update-btn"
                        onClick={fnReadAll}
                    >
                        모두 읽음
                    </button>
                </div>

                {notiList.length === 0 ? (
                    <div
                        style={{
                            padding: "20px",
                            textAlign: "center",
                            color: "#777"
                        }}
                    >
                        알림이 없습니다.
                    </div>
                ) : (
                    <div>
                        {notiList.map(item => (
                            <div
                                key={item.NOTI_ID}
                                style={{
                                    padding: "15px",
                                    marginBottom: "10px",
                                    borderRadius: "12px",
                                    background:
                                        item.IS_READ === "N"
                                            ? "#eaf4ff"
                                            : "#f5f5f5",
                                    border:
                                        item.IS_READ === "N"
                                            ? "1px solid #90caf9"
                                            : "1px solid #ddd"
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: "bold",
                                            fontSize: "16px"
                                        }}
                                    >
                                        {getTypeIcon(item.NOTI_TYPE)}{" "}
                                        {item.MESSAGE}
                                    </div>

                                    <span
                                        style={{
                                            fontSize: "12px",
                                            color: "#777"
                                        }}
                                    >
                                        {item.CDATETIME}
                                    </span>
                                </div>

                                <div
                                    style={{
                                        marginTop: "10px",
                                        display: "flex",
                                        gap: "10px"
                                    }}
                                >
                                    {(item.NOTI_TYPE === "COMMENT" ||
                                        item.NOTI_TYPE === "LIKE" ||
                                        item.NOTI_TYPE === "REPLY") && (
                                        <Link
                                            to={"/post/" + item.REF_ID}
                                            onClick={() =>
                                                fnReadNotification(item.NOTI_ID)
                                            }
                                            style={{
                                                color: "#1976d2",
                                                fontWeight: "bold",
                                                textDecoration: "none"
                                            }}
                                        >
                                            게시글 보러가기
                                        </Link>
                                    )}

                                    {item.IS_READ === "N" && (
                                        <button
                                            className="list-btn"
                                            onClick={() =>
                                                fnReadNotification(item.NOTI_ID)
                                            }
                                        >
                                            읽음 처리
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Notification;