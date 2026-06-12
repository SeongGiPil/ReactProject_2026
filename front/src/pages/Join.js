import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Join() {
    const navigate = useNavigate();

    const [userId, setUserId] = useState("");
    const [pwd, setPwd] = useState("");
    const [pwdCheck, setPwdCheck] = useState("");
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");

    const [isIdCheck, setIsIdCheck] = useState(false);

    const [teamList, setTeamList] = useState([]);
    const [selectedTeams, setSelectedTeams] = useState([]);

    function fnGetTeamList() {
        fetch("http://192.168.30.76.3010/team/list")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTeamList(data.list);
                }
            })
            .catch(err => {
                console.log(err);
                alert("팀 목록 조회 실패");
            });
    }

    function fnIdCheck() {
        if (!userId) {
            alert("아이디를 입력하세요.");
            return;
        }

        fetch("http://192.168.30.76.3010/user/check/" + userId)
            .then(res => res.json())
            .then(data => {
                if (data.exists) {
                    alert("이미 사용 중인 아이디입니다.");
                    setIsIdCheck(false);
                } else {
                    alert("사용 가능한 아이디입니다.");
                    setIsIdCheck(true);
                }
            })
            .catch(err => {
                console.log(err);
                alert("중복체크 실패");
            });
    }

    function fnTeamCheck(teamId) {
        if (selectedTeams.includes(teamId)) {
            setSelectedTeams(
                selectedTeams.filter(id => id !== teamId)
            );
        } else {
            setSelectedTeams([
                ...selectedTeams,
                teamId
            ]);
        }
    }

    function fnJoin() {
        if (!userId || !pwd || !pwdCheck || !nickname || !email) {
            alert("모든 항목을 입력하세요.");
            return;
        }

        if (!isIdCheck) {
            alert("아이디 중복체크를 해주세요.");
            return;
        }

        if (pwd !== pwdCheck) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        fetch("http://192.168.30.76.3010/user/join", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId,
                pwd,
                nickname,
                email,
                teamList: selectedTeams
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("회원가입 성공");
                    navigate("/");
                } else {
                    alert(data.message);
                }
            })
            .catch(err => {
                console.log(err);
                alert("서버 오류");
            });
    }

    useEffect(() => {
        fnGetTeamList();
    }, []);

    return (
        <div className="auth-page">
            <div className="auth-card auth-card-large">
                <h2 className="auth-title">
                    SpoTalk 회원가입
                </h2>

                <p className="auth-subtitle">
                    스포츠 팬들과 함께 응원하고 소통해보세요.
                </p>

                <div className="id-check-row">
                    <input
                        className="auth-input"
                        type="text"
                        placeholder="아이디"
                        value={userId}
                        onChange={(e) => {
                            setUserId(e.target.value);
                            setIsIdCheck(false);
                        }}
                    />

                    <button
                        className="insert-btn"
                        onClick={fnIdCheck}
                    >
                        중복확인
                    </button>
                </div>

                <input
                    className="auth-input"
                    type="password"
                    placeholder="비밀번호"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                />

                <input
                    className="auth-input"
                    type="password"
                    placeholder="비밀번호 확인"
                    value={pwdCheck}
                    onChange={(e) => setPwdCheck(e.target.value)}
                />

                <input
                    className="auth-input"
                    type="text"
                    placeholder="닉네임"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />

                <input
                    className="auth-input"
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <div className="team-select-box">
                    <div className="team-select-title">
                        응원팀 선택
                    </div>

                    <div className="team-select-sub">
                        선택하지 않아도 회원가입 가능합니다.
                    </div>

                    {teamList.map(team => (
                        <label
                            key={team.TEAM_ID}
                            className="team-item"
                        >
                            <input
                                type="checkbox"
                                checked={selectedTeams.includes(team.TEAM_ID)}
                                onChange={() => fnTeamCheck(team.TEAM_ID)}
                            />
                            {" "}
                            {team.TEAM_NAME}
                        </label>
                    ))}
                </div>

                <button
                    className="auth-btn join-btn"
                    onClick={fnJoin}
                >
                    회원가입
                </button>

                <div className="auth-link-box">
                    이미 계정이 있나요?{" "}
                    <Link to="/">
                        로그인으로 이동
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Join;