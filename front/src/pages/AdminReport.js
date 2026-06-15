import React, { useEffect, useState } from "react";

function AdminReport() {
    const [reportList, setReportList] = useState([]);

    // 신고 목록 조회
    function fnGetReportList() {
        fetch("http://192.168.30.76:3010/report/list")
            .then(res => res.json())
            .then(data => {
                console.log("신고 목록 :", data);

                if (data.success) {
                    setReportList(data.list || []);
                }
            })
            .catch(err => {
                console.log(err);
                alert("신고 목록 조회 실패");
            });
    }

    // 신고 상태 처리
    function fnUpdateReport(reportId, status) {
        fetch("http://192.168.30.76:3010/report/" + reportId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                reportStatus: status
            })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);

                if (data.success) {
                    fnGetReportList();
                }
            })
            .catch(err => {
                console.log(err);
                alert("신고 처리 실패");
            });
    }

    // 신고 상태 한글 변환
    function fnStatusName(status) {
        if (status === "WAIT") return "접수중";
        if (status === "DONE") return "처리완료";
        if (status === "REJECT") return "반려";
        return status;
    }

    useEffect(() => {
        fnGetReportList();
    }, []);

    return (
        <div className="mypage-container">
            <h2 className="page-title">
                🚨 신고 관리
            </h2>

            <div className="mypage-card">
                <h3 className="section-title">
                    신고 목록
                </h3>

                <table>
                    <thead>
                        <tr>
                            <th>신고번호</th>
                            <th>신고자</th>
                            <th>대상유형</th>
                            <th>대상번호</th>
                            <th>사유</th>
                            <th>상태</th>
                            <th>신고일</th>
                            <th>처리</th>
                        </tr>
                    </thead>

                    <tbody>
                        {reportList.length === 0 ? (
                            <tr>
                                <td colSpan="8">
                                    신고 내역이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            reportList.map(item => (
                                <tr key={item.REPORT_ID}>
                                    <td>{item.REPORT_ID}</td>
                                    <td>{item.USER_ID}</td>
                                    <td>{item.TARGET_TYPE}</td>
                                    <td>{item.TARGET_ID}</td>
                                    <td>{item.REASON}</td>
                                    <td>{fnStatusName(item.REPORT_STATUS)}</td>
                                    <td>{item.CDATETIME}</td>
                                    <td>
                                        {item.REPORT_STATUS === "WAIT" ? (
                                            <>
                                                <button
                                                    className="update-btn"
                                                    onClick={() =>
                                                        fnUpdateReport(
                                                            item.REPORT_ID,
                                                            "DONE"
                                                        )
                                                    }
                                                >
                                                    처리완료
                                                </button>

                                                {" "}

                                                <button
                                                    className="delete-btn"
                                                    onClick={() =>
                                                        fnUpdateReport(
                                                            item.REPORT_ID,
                                                            "REJECT"
                                                        )
                                                    }
                                                >
                                                    반려
                                                </button>
                                            </>
                                        ) : (
                                            <span>
                                                처리됨
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminReport;