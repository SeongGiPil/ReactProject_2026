import React, { useEffect, useState } from "react";

function Banner() {
    const [bannerList, setBannerList] = useState([]);

    function fnGetBannerList() {
        fetch("http://localhost:3010/banner")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBannerList(data.list || []);
                }
            })
            .catch(err => {
                console.log("배너 조회 실패 :", err);
                setBannerList([]);
            });
    }

    useEffect(() => {
        fnGetBannerList();
    }, []);

    if (bannerList.length === 0) {
        return null;
    }

    return (
        <div
            style={{
                width: "100%",
                marginBottom: "20px"
            }}
        >
            {bannerList.map(item => (
                <div
                    key={item.FILE_NO}
                    style={{
                        width: "100%",
                        marginBottom: "12px"
                    }}
                >
                    <img
                        src={"http://localhost:3010" + item.FILE_PATH}
                        alt={item.ORIGIN_NAME || "배너 이미지"}
                        style={{
                            width: "100%",
                            height: "180px",
                            objectFit: "cover",
                            borderRadius: "12px",
                            display: "block"
                        }}
                    />
                </div>
            ))}
        </div>
    );
}

export default Banner;