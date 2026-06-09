# ⚾ SpoTalk SNS
![로그인](image/login.jpg)

야구 팬들의 일상을 기록하고 공유하는 스포츠 팬 커뮤니티 SNS
SpoTalk에서 응원팀을 선택하고, 게시글과 댓글, 좋아요, 팔로우를 통해 팬들과 소통해보세요.

---

## 프로젝트소개
-SpoTalk은 스포츠 팬들이 자유롭게 소통할 수 있는 SNS 플랫폼입니다.
-팀별게시판을 활용하여 같은 응원팀을 응원하는 사람과의 정보 공유도 가능하고, 
통합게시판을 통하여 모든 야구팬과의 정보공유등이 가능하고자 만들어진 플랫폼입니다

---
## 개발기간
#### 2026.06.01~2026.06.08(개발 및 설계)
---
## 프로젝트 기획배경

-일반 SNS는 프로야구  팬들을 위한 기능이 부족하여 불편하였습니다. 그러한 불편함을 해소하고자
프로야구 팬 커뮤니티 게시판을 만들게되었습니다

---
## 사용기술

| 구분              | 기술                                               |
| --------------- | ------------------------------------------------ |
| Front-End       | ![React](https://img.shields.io/badge/React-FFFFFF?style=for-the-badge&logo=react&logoColor=61DAFB), ![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E), ![React Router](https://img.shields.io/badge/React_Router-20232A?style=for-the-badge&logo=reactrouter&logoColor=CA4245), ![MUI](https://img.shields.io/badge/MUI-20232A?style=for-the-badge&logo=mui&logoColor=007FFF) |
| Back-End        | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white), ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white),![JWT](https://img.shields.io/badge/JWT-20232A?style=for-the-badge&logo=jsonwebtokens&logoColor=D63AFF)                            |
| Database        |![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)                         |
| Version Control | ![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white),  ![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)                              
---
## 주요기능

## 1.로그인  
![로그인화면](image/login.jpg)
## 2.회원가입
![회원가입](image/join.jpg)

## 3.메인페이지
![회원가입](image/main.jpg)
## 4.게시판
![게시판](image/게시판.JPG)
## 5.마이페이지
![마이페이지](image/mypage.JPG)
## 6.관리자페이지
![게시판](image/관리자페이지.JPG)
---
##  프로젝트 구조

```text
SpoTalk
├── react-front
│   ├── public
│   ├── src
│   │   ├── components
│   │   │   ├── Banner.js
│   │   │   ├── Main.js
│   │   │   ├── Menu.js
│   │   │   └── Sub.js
│   │   ├── pages
│   │   │   ├── Login.js
│   │   │   ├── Join.js
│   │   │   ├── Feed.js
│   │   │   ├── PostView.js
│   │   │   ├── Write.js
│   │   │   ├── MyPage.js
│   │   │   ├── Notification.js
│   │   │   ├── FollowList.js
│   │   │   ├── TeamBoard.js
│   │   │   ├── AdminReport.js
│   │   │   └── AdminPost.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── express-back
│   ├── routes
│   │   ├── user.js
│   │   ├── post.js
│   │   ├── comment.js
│   │   ├── like.js
│   │   ├── follow.js
│   │   ├── notification.js
│   │   ├── report.js
│   │   └── banner.js
│   ├── uploads
│   ├── auth.js
│   ├── db.js
│   ├── app.js
│   └── package.json
│
└── README.md
```
## 추후 보완사항

-소셜로그인 추가
-베너 광고추가
-팔로워 채팅기능 추가
---
## 개발후기
일반 sns기능에 프로야구 팬들을 위한 기능이 많지는 않아 프로야구 팬으로서 안타까운점이 있었는데 이렇게 직접 구현을 해보니 부족한점도 많이 느꼈고 다양한 문제를 해결해 나감으로써 한단계 성장해 나가지않았나 생각한다.포기하지않고 어려움을 해결하고 지속적으로 도전하며 꾸준히 성장하는 개발자가 되고싶다

