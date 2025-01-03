import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const MypageProfileContext = createContext();

export const useMypageProfileContext = () => useContext(MypageProfileContext);

const MypageProfileProvider = ({ children }) => {
    
    const [userInfo, setUserInfo] = useState(null); // 사용자 정보 상태
    const [formData, setFormData] = useState({
        userId: "",
        pwd: "",
        confirmPwd: "",
        name: "",
        gender: "",
        zipcode: "",
        addr1: "",
        addr2: "",
        phone1: "",
        phone2: "",
        phone3: "",
        email: "",
        birth: "",
    });

    const navigate = useNavigate();

    const [errors, setErrors] = useState({});
    const [showTooltip, setShowTooltip] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState(""); // 빈 문자열로 초기화
    const [showCouponTooltip, setShowCouponTooltip] = useState(false);


    const { refreshAccessToken, logout } = useAuth();  // useAuth에서 refreshAccessToken 가져오기

    //2024-12-19 비밀번호 정규화 추가 장훈
    const validatePassword = (password) => {
        // 비밀번호 정규식: 영문, 숫자, 특수문자 조합 8~15자
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/;
        return passwordRegex.test(password);
    };

    const validateForm = () => {
        const newErrors = {};
        const refs = {};

        if (!formData.name) {
            newErrors.name = "이름을 입력해 주세요.";
            refs.name = document.querySelector('input[name="name"]');
        }
        if (!formData.email) {
            newErrors.email = "이메일을 입력해 주세요.";
            refs.email = document.querySelector('input[name="email"]');
        }
        if (!formData.phone1 || formData.phone1.length !== 3 || !/^\d{3}$/.test(formData.phone1)) {
            newErrors.phone = "전화번호 첫 번째(3자리 숫자)를 입력해 주세요.";
            refs.phone = document.querySelector('input[name="phone1"]');
        }
        if (!formData.phone2 || formData.phone2.length !== 4 || !/^\d{4}$/.test(formData.phone2)) {
            newErrors.phone = "전화번호 두 번째(4자리 숫자)를 입력해 주세요.";
            refs.phone = document.querySelector('input[name="phone2"]');
        }
        if (!formData.phone3 || formData.phone3.length !== 4 || !/^\d{4}$/.test(formData.phone3)) {
            newErrors.phone = "전화번호 세 번째(4자리 숫자)를 입력해 주세요.";
            refs.phone = document.querySelector('input[name="phone3"]');
        }
        //회원정보 수정시 비밀번호를 입력하지 않으면, DB의 비밀번호 값 그대로 유지
        // if (!formData.pwd) newErrors.pwd = "비밀번호를 입력해 주세요.";
        //2024-12-19 비밀번호 정규화 추가 장훈
        if (formData.pwd) {
            if (!validatePassword(formData.pwd)) {
                newErrors.pwd = "비밀번호는 영문, 숫자, 특수문자 조합으로 8~15자여야 합니다.";
                refs.pwd = document.querySelector('input[name="pwd"]');
            }
        }
        if (formData.pwd !== formData.confirmPwd) {
            newErrors.confirmPwd = "비밀번호가 일치하지 않습니다.";
            refs.confirmPwd = document.querySelector('input[name="confirmPwd"]');
        }

        setErrors(newErrors);

        // 첫 번째 에러가 있는 필드로 포커스
        const firstErrorField = Object.keys(newErrors)[0];
        if (firstErrorField && refs[firstErrorField]) {
            refs[firstErrorField].focus();
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value || "", // 기본값을 빈 문자열로 설정
        }));

        // 입력값이 변경될 때 해당 필드의 에러 메시지 검증
        setErrors(prevErrors => {
            const newErrors = { ...prevErrors };

            switch (name) {
                case 'name':
                    if (value) delete newErrors.name;
                    break;
                case 'email':
                    if (value) delete newErrors.email;
                    break;
                case 'phone1':
                    if (value && value.length === 3 && /^\d{3}$/.test(value)) {
                        delete newErrors.phone;
                    }
                    break;
                case 'phone2':
                    if (value && value.length === 4 && /^\d{4}$/.test(value)) {
                        delete newErrors.phone;
                    }
                    break;
                case 'phone3':
                    if (value && value.length === 4 && /^\d{4}$/.test(value)) {
                        delete newErrors.phone;
                    }
                    break;
                case 'pwd':
                    if (!value || validatePassword(value)) {
                        delete newErrors.pwd;
                    }
                    if (value === formData.confirmPwd) {
                        delete newErrors.confirmPwd;
                    }
                    break;
                case 'confirmPwd':
                    if (value === formData.pwd) {
                        delete newErrors.confirmPwd;
                    }
                    break;
            }

            return newErrors;
        });
    };

    const handleBlur = () => {
        if (formData.pwd && formData.confirmPwd && formData.pwd !== formData.confirmPwd) {
            setErrors((prevErrors) => ({ ...prevErrors, confirmPwd: "비밀번호가 일치하지 않습니다." }));
        } else {
            setErrors((prevErrors) => ({ ...prevErrors, confirmPwd: "" }));
        }
    };

     // 회원정보 수정
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;  // 유효성 검사를 통과하지 못하면 서버로 전송하지 않음

        //전화번호 저장 시 하이픈 추가
        const phone = `${formData.phone1}-${formData.phone2}-${formData.phone3}`;

        // 서버로 전송할 데이터 준비
        const updateData = {
            userId: formData.userId || null,
            name: formData.name || null,
            gender: formData.gender || null,
            address: formData.addr1 || null, // 기본 주소
            zipcode: formData.zipcode || null, // 우편번호
            addr1: formData.addr1 || null, // 기본 주소
            addr2: formData.addr2 || null, // 상세 주소
            tel: phone || null, // 전화번호
            email: formData.email || null,
            pwd: formData.pwd || null, // 비밀번호
            height: formData.height || null, // 키
            weight: formData.weight || null, // 몸무게
            birth:formData.birth || null // 생일
        };
        console.log(updateData);
        try {
            await axiosInstance.post(`/api/user/mypage/update`, updateData);
            alert("회원정보가 성공적으로 수정되었습니다!");
            navigate("/mypage");
        } catch (error) {
            console.error("Error:", error);
            if (error.response?.status === 401) {
                // 토큰 만료 시 갱신 시도
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    // 토큰 갱신 성공 시 다시 요청
                    handleSubmit(e);
                } else {
                    alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                    navigate("/user");
                }
            } else {
                alert("회원정보 수정 중 오류가 발생했습니다.");
            }
        }
    };

    const updateFormData = (key, value) => {
        setFormData((prevData) => ({ ...prevData, [key]: value }));
    };

    const loadDaumPostcodeScript = () => {
        return new Promise((resolve) => {
            if (document.getElementById("daum-postcode-script")) {
                resolve();
                return;
            }

            const script = document.createElement("script");
            script.id = "daum-postcode-script";
            script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
            script.onload = resolve;
            document.body.appendChild(script);
        });
    };

    const handleFindPostalCode = async () => {
        try {
            await loadDaumPostcodeScript();

            new window.daum.Postcode({
                oncomplete: function (data) {
                    updateFormData("zipcode", data.zonecode);
                    updateFormData("addr1", data.roadAddress);
                },
            }).open();
        } catch (error) {
            console.error("우편번호 찾기 스크립트 로드 실패:", error);
            alert("우편번호 찾기 기능을 사용할 수 없습니다. 잠시 후 다시 시도해주세요.");
        }
    };

    const handleCouponMouseEnter = () => {
        setShowCouponTooltip(true);
    };

    const handleCouponMouseLeave = () => {
        setShowCouponTooltip(false);
    };

    const handleMouseEnter = () => setShowTooltip(true);
    const handleMouseLeave = () => setShowTooltip(false);

    const handleOpenModal = () => {
        // 카카오 로그인 사용자의 경우 모달 표시 없이 바로 탈퇴 처리
        if (userInfo?.loginType === 'KAKAO') {
            if (window.confirm('정말로 탈퇴하시겠습니까?')) {
                handleDeleteAccount();
            }
        } else {
            setShowModal(true);
        }
    };
    const handleCloseModal = () => setShowModal(false);

    const handleDeletePasswordChange = (e) => setDeletePassword(e.target.value);

    const handleDeleteAccount = async () => {
        const token = localStorage.getItem("accessToken");
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        const id = decodedPayload.id;

        try {
            // 카카오 로그인 사용자의 경우 비밀번호 없이 바로 삭제 요청
            if (userInfo?.loginType === 'KAKAO') {
                await axiosInstance.post('/api/user/mypage/delete', {
                    userId: id,
                    pwd: ''
                });
                alert("회원 탈퇴가 완료되었습니다.");
                await logout();
                navigate("/");
            } else {
                // 일반 사용자의 경우 비밀번호 검증 후 삭제
                if (!deletePassword) {
                    alert("비밀번호를 입력해주세요.");
                    return;
                }

                const response = await axiosInstance.post('/api/user/mypage/delete', {
                    userId: id,
                    pwd: deletePassword
                });
    
                if (response.status === 200) {
                    alert("회원 탈퇴가 완료되었습니다.");
                    await logout();
                    navigate("/");
                }
            }
        } catch (error) {
            console.error("Account deletion error:", error);
            // 401 상태 코드는 비밀번호가 틀린 경우
            if (error.response?.status === 401) {
                alert("비밀번호가 틀렸습니다.");
            } 
            // 409 상태 코드는 중복 로그인의 경우
            else if (error.response?.status === 409) {
                alert("다른 기기에서 로그인되어 있습니다.");
            } 
            // 그 외의 에러
            else {
                alert("회원 탈퇴 처리 중 오류가 발생했습니다.");
            }
        }
    };



    const handleCancel = () => {

        const { phone1, phone2, phone3 } = splitPhoneNumber(userInfo?.tel || "");

        setFormData({
            userId: userInfo?.userId || "",
            pwd: "",
            confirmPwd: "",
            name: userInfo?.name || "",
            gender: userInfo?.gender || "M",
            zipcode: userInfo?.zipcode || "",
            addr1: userInfo?.addr1 || "",
            addr2: userInfo?.addr2 || "",
            phone1,
            phone2,
            phone3,
            email: userInfo?.email || "",
            birth: userInfo?.birth || "",
            height: userInfo?.height || "",
            weight: userInfo?.weight || "",
        });
        alert("수정이 취소되었습니다.");
    };

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        console.log("Access Token:", token);

        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/user");
            return;
        }

         // 토큰 디코딩 (jwt-decode 없이)
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        const id = decodedPayload.id;  //토큰에 있는 id 추출
        console.log("User ID:", id);


        const fetchUserInfo = async () => {
            try {
                const response = await axiosInstance.get(`/api/user/mypage/info/${id}`);
                const data = response.data;
                console.log("서버 응답 데이터:", data);  // 추가된 로그
                const { phone1, phone2, phone3 } = splitPhoneNumber(data.tel);

                setUserInfo(data);
                setFormData({
                    userId: data.userId || "",
                    name: data.name || "",
                    gender: data.gender || "",
                    zipcode: data.zipcode || "",
                    addr1: data.addr1 || "",
                    addr2: data.addr2 || "",
                    phone1: phone1 || "",
                    phone2: phone2 || "",
                    phone3: phone3 || "",
                    email: data.email || "",
                    height: data.height || "",
                    weight: data.weight || "",
                    birth: data.birth || "",
                });
            } catch (error) {
                console.error("에러 메시지:" + error);
                if (error.response?.status === 401) {
                    // 토큰 만료 시 갱신 시도
                    const refreshed = await refreshAccessToken();
                    if (refreshed) {
                        // 토큰 갱신 성공 시 다시 데이터 요청
                        fetchUserInfo();
                    } else {
                        // 리프레시 토큰도 만료된 경우에만 로그인 페이지로 이동
                        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                        navigate("/user");
                    }
                } else {
                    alert("사용자 정보를 가져오는 중 오류가 발생했습니다.");
                }
            }
        };

        fetchUserInfo();
    }, [navigate, refreshAccessToken]);
    console.log(formData);

    const splitPhoneNumber = (tel) => {
        if (!tel) return { phone1: "", phone2: "", phone3: "" };
        const phoneParts = tel.match(/^(\d{3})-(\d{4})-(\d{4})$/);
        console.log(phoneParts);
        return phoneParts ? { phone1: phoneParts[1], phone2: phoneParts[2], phone3: phoneParts[3] } : { phone1: "", phone2: "", phone3: "" };
    };



    const value = {
        userInfo,
        formData,
        errors,
        setFormData,
        handleSubmit,
        handleDeleteAccount,
        handleDeletePasswordChange: (e) => setDeletePassword(e.target.value),
        handleChange,
        handleBlur,
        handleFindPostalCode,
        handleMouseEnter,
        handleMouseLeave,
        handleOpenModal,
        handleCloseModal,
        handleCancel,
        //handleDeletePasswordChange, 2024/12/24 중복 선언으로 오류 남 장훈 (03:06)
        showTooltip,
        showModal,
        deletePassword,
        validatePassword,
        validateForm,
        loadDaumPostcodeScript,
        splitPhoneNumber,
        handleCouponMouseEnter,
        handleCouponMouseLeave,
        showCouponTooltip,
    };

    return (
        <MypageProfileContext.Provider value={value}>
            {children}
        </MypageProfileContext.Provider>
    );
};

export default MypageProfileProvider;