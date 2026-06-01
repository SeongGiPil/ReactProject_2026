import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Join() {
    const navigate = useNavigate();

    const [userId, setUserId] = useState("");
    const [pwd, setPwd] = useState("");
    const [pwdCheck, setPwdCheck] = useState("");
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");

    // 아이디 중복체크 여부
    const [isIdCheck, setIsIdCheck] = useState(false);

    // 팀 목록
    const [teamList, setTeamList] = useState([]);

    // 선택한 팀 목록
    const [selectedTeams, setSelectedTeams] = useState([]);

    // 팀 목록 조회
    function fnGetTeamList() {
        fetch("http://localhost:3010/team/list")
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

    // 아이디 중복체크
    function fnIdCheck() {
        if (!userId) {
            alert("아이디를 입력하세요.");
            return;
        }

        fetch("http://localhost:3010/user/check/" + userId)
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

    // 팀 체크/해제
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

    // 회원가입
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

        fetch("http://localhost:3010/user/join", {
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

    // 페이지 처음 열릴 때 팀 목록 조회
    useEffect(() => {
        fnGetTeamList();
    }, []);

    return (
        <div
            style={{
                width: "430px",
                margin: "60px auto",
                border: "1px solid #ddd",
                padding: "30px",
                borderRadius: "10px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)"
            }}
        >
            <h2 style={{ textAlign: "center" }}>
                회원가입
            </h2>

            <div style={{ display: "flex", gap: "5px" }}>
                <input
                    type="text"
                    placeholder="아이디"
                    value={userId}
                    onChange={(e) => {
                        setUserId(e.target.value);
                        setIsIdCheck(false);
                    }}
                    style={{
                        width: "75%",
                        height: "40px",
                        marginBottom: "10px",
                        padding: "0 10px",
                        boxSizing: "border-box"
                    }}
                />

                <button
                    onClick={fnIdCheck}
                    style={{
                        width: "25%",
                        height: "40px"
                    }}
                >
                    중복체크
                </button>
            </div>

            <input
                type="password"
                placeholder="비밀번호"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                style={inputStyle}
            />

            <input
                type="password"
                placeholder="비밀번호 확인"
                value={pwdCheck}
                onChange={(e) => setPwdCheck(e.target.value)}
                style={inputStyle}
            />

            <input
                type="text"
                placeholder="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                style={inputStyle}
            />

            <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
            />

            {/* 응원팀 선택 */}
            <div
                style={{
                    marginTop: "10px",
                    marginBottom: "15px",
                    padding: "15px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    backgroundColor: "#fafafa"
                }}
            >
                <div
                    style={{
                        fontWeight: "bold",
                        marginBottom: "10px"
                    }}
                >
                    응원팀 선택
                    <span style={{ fontSize: "12px", color: "#888" }}>
                        {" "}(선택 안 해도 가능)
                    </span>
                </div>

                {teamList.map(team => (
                    <label
                        key={team.TEAM_ID}
                        style={{
                            display: "inline-block",
                            width: "50%",
                            marginBottom: "8px",
                            cursor: "pointer"
                        }}
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
                onClick={fnJoin}
                style={{
                    width: "100%",
                    height: "45px",
                    backgroundColor: "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                }}
            >
                회원가입
            </button>

            <div
                style={{
                    marginTop: "15px",
                    textAlign: "center"
                }}
            >
                <Link to="/">
                    로그인으로 이동
                </Link>
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    height: "40px",
    marginBottom: "10px",
    padding: "0 10px",
    boxSizing: "border-box"
};

export default Join;