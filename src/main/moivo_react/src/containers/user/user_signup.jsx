import React, {useState} from "react";
import axios from "axios";
import singup from '../../assets/css/user_sigup.module.css';
import {Link, useNavigate} from 'react-router-dom';
import Footer from './../../components/Footer/Footer';
import Banner from '../../components/Banner/banner';
import {PATH} from "../../../scripts/path";

function UserSignup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        userId: "",
        pwd: "",
        confirmPwd: "",
        name: "",
        postalCode: "",
        address: "",
        detailedAddress: "",
        phone1: "",
        phone2: "",
        phone3: "",
        email: "",
    });

    const [errors, setErrors] = useState({
        userId: "",
        pwd: "",
        confirmPwd: "",
        name: "",
        address: "",
        phone: "",
        email: "",
    });

    // 동적 스크립트 로드 함수
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

    // 우편번호 찾기 함수
    const handleFindPostalCode = async () => {
        try {
            await loadDaumPostcodeScript();

            new window.daum.Postcode({
                oncomplete: function (data) {
                    setFormData((prevData) => ({
                        ...prevData,
                        postalCode: data.zonecode,
                        address: data.roadAddress,
                    }));
                },
            }).open();
        } catch (error) {
            console.error("우편번호 찾기 스크립트 로드 실패:", error);
        }
    };

    // 입력값 변경 처리 함수
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
        setErrors((prevErrors) => ({...prevErrors, [name]: ""}));
    };

    // ID 중복 체크 포커스 아웃시 검증
    const IdCheckHandleBlur = async (e) => {
        const {name} = e.target;

        //ID 중복 체크
        if (name === "userId") {
            if (!formData.userId) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    userId: "아이디를 입력해주세요.",
                }));
                return;
            }

            try {
                // 서버로 GET 요청 전송
                const response = await axios.get(`${PATH.SERVER}/api/user/idCheck`, {
                    params: {userId: formData.userId}, // GET 요청 파라미터
                });
                console.log(response.status);
                if(response.status === 201){
                    // 성공적으로 사용 가능한 아이디인 경우
                    console.log("status = " + response.status); // 201 Created 상태 코드 확인
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        userId: "사용 가능한 아이디입니다.", // 성공 메시지
                    }));
                }

            } catch (error) {
                if (error.response.status === 409) {
                    console.log(error.response.status)
                    // 중복된 아이디인 경우 (409 Conflict)
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        userId: "이미 사용 중인 아이디입니다.",
                    }));
                } else {
                    // 기타 에러
                    console.error("아이디 중복 확인 실패:", error);
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        userId: "아이디 중복 확인에 실패했습니다.",
                    }));
                }

            }
        }
    }
    // ID 중복 체크 포커스 아웃시 검증

    // 포커스 아웃 시 검증
    const handleBlur = (e) => {
        const {name} = e.target;

        // 휴대폰 번호 검증
        if (name === "phone1" || name === "phone2" || name === "phone3") {
            // phone1, phone2, phone3 모두 입력되었는지 확인
            if (!formData.phone1 || !formData.phone2 || !formData.phone3) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    phone: "전화번호를 모두 입력해주세요.",
                }));
            } else {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    phone: "",
                }));
            }
        } else if (name === "postalCode" || name === "address" || name === "detailedAddress") {
            // 주소 필드 검증
            if (!formData.postalCode || !formData.address || !formData.detailedAddress) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    address: "주소를 모두 입력해주세요.",
                }));
            } else {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    address: "",
                }));
            }
        } else {
            // 다른 필드들에 대한 검증
            validateField(name);
        }
    };

    // 필드별 검증 함수
    const validateField = (fieldName) => {
        let newError = '';
        let value = formData[fieldName];

        switch (fieldName) {
            case "userId":
                newError = value ? "" : "아이디를 입력해주세요.";
                break;
            case "pwd":
                newError = value ? "" : "비밀번호를 입력해주세요.";
                break;
            case "confirmPwd":
                newError = formData.pwd !== formData.confirmPwd ? "비밀번호가 일치하지 않습니다." : "";
                break;
            case "name":
                newError = value ? "" : "이름을 입력해주세요.";
                break;
            case "address":
                newError = formData.postalCode && formData.address && formData.detailedAddress ? "" : "주소를 모두 입력해주세요.";
                break;
            case "phone1":
            case "phone2":
            case "phone3":
                // 전화번호 3개 필드 중 하나라도 비어있으면 오류 메시지
                if (!formData.phone1 || !formData.phone2 || !formData.phone3) {
                    newError = "전화번호를 모두 입력해주세요.";
                } else {
                    newError = "";
                }
                break;
            case "email":
                newError = value ? "" : "이메일을 입력해주세요.";
                break;
            default:
                break;
        }

        setErrors((prevErrors) => ({
            ...prevErrors,
            [fieldName]: newError, // 개별 필드의 오류 메시지만 업데이트
        }));

        return newError; // 오류 메시지를 반환
    };

    // 폼 검증 함수
    const validateForm = () => {
        let isValid = true;
        let newErrors = {};

        // 각 필드에 대해 검증 , 오류면 isValid를 false로 설정
        Object.keys(formData).forEach((field) => {
            const error = validateField(field);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        setErrors((prevErrors) => ({
            ...prevErrors,
            ...newErrors,
        }));

        return isValid;
    };

    // 폼 제출 처리 함수
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // 2024-12-12 phoneNuber 합치기 장훈
            const fullPhoneNumber = `${formData.phone1}-${formData.phone2}-${formData.phone3}`;
            await axios.post(`${PATH.SERVER}/api/user/join`, {
                userId: formData.userId,
                pwd: formData.pwd,
                name: formData.name,
                email: formData.email,
                gender: formData.gender,
                zipcode: formData.postalCode,
                addr1: formData.address,
                addr2: formData.detailedAddress,
                tel: fullPhoneNumber
            });
            alert("회원가입 성공!");
            navigate("/user");
        } catch (error) {
            console.error("회원가입 실패:", error);
            alert("회원가입에 실패했습니다.");
        }
    };

    return (
        <div className={singup.signupContainer}>
            <div className={singup.signbanner}>
                <Banner/>
            </div>
            <div className={singup.signheader}></div>
            <div className={singup.pageName}>Sign Up</div>
            <div className={singup.signupDiv}>
                <form className={singup.signupForm} onSubmit={handleSubmit}>
                    {/* ID */}
                    <div className={singup.formRow}>
                        <span>ID</span>
                        <input type="text" name="userId" value={formData.userId} onChange={handleChange}
                               onBlur={IdCheckHandleBlur}/>
                        <div className={singup.exception}>{errors.userId}</div>
                    </div>
                    <hr className={singup.signupline}/>

                    {/* Password */}
                    <div className={singup.formRow}>
                        <span>PASSWORD</span>
                        <input type="password" name="pwd" value={formData.pwd} onChange={handleChange}
                               onBlur={handleBlur}/>
                        <div className={singup.exception}>{errors.pwd}</div>
                    </div>
                    <hr className={singup.signupline}/>

                    {/* Confirm Password */}
                    <div className={singup.formRow}>
                        <span>CONFIRM PASSWORD</span>
                        <input type="password" name="confirmPwd" value={formData.confirmPwd} onChange={handleChange}
                               onBlur={handleBlur}/>
                        <div className={singup.exception}>{errors.confirmPwd}</div>
                    </div>
                    <hr className={singup.signupline}/>

                    {/* Name */}
                    <div className={singup.formRow}>
                        <span>NAME</span>
                        <input type="text" name="name" value={formData.name} onChange={handleChange}
                               onBlur={handleBlur}/>
                        <div className={singup.exception}>{errors.name}</div>
                    </div>
                    <hr className={singup.signupline}/>

                    {/* Gender */}
                    <div className={singup.formRow}>
                        <span>GENDER</span>
                        <div className={singup.radioContainer}>
                            <input type="radio" name="gender" value="M" checked={formData.gender === "M"}
                                   onChange={handleChange}/> Male
                            <input type="radio" name="gender" value="F" checked={formData.gender === "F"}
                                   onChange={handleChange}/> Female
                        </div>
                        <div className={singup.exception}>{errors.gender}</div>
                    </div>
                    <hr className={singup.signupline}/>

                    {/* Address */}
                    <div className={singup.formRow}>
                        <span>ADDRESS</span>
                        <div className={singup.addressContainer}>
                            <div className={singup.postalRow}>
                                <input type="text" name="postalCode" placeholder="우편번호" value={formData.postalCode}
                                       onChange={handleChange} onBlur={handleBlur}/>
                                <button type="button" onClick={handleFindPostalCode} className={singup.findButton}>
                                    우편번호 찾기
                                </button>
                            </div>
                            <div className={singup.detailedAddress}>
                                <input type="text" name="address" placeholder="기본 주소" value={formData.address}
                                       onChange={handleChange} onBlur={handleBlur}/>
                            </div>
                            <div className={singup.detailedAddress}>
                                <input type="text" name="detailedAddress" placeholder="상세 주소"
                                       value={formData.detailedAddress} onChange={handleChange} onBlur={handleBlur}/>
                            </div>
                        </div>
                        <div className={singup.exception}>{errors.address}</div>
                    </div>
                    <hr className={singup.signupline}/>

                    {/* Phone */}
                    <div className={singup.formRow}>
                        <span>PHONE</span>
                        <div className={singup.phoneRow}>
                            <input type="text" name="phone1" placeholder="010" maxLength="3" value={formData.phone1}
                                   onChange={handleChange} onBlur={handleBlur}/>
                            <p>-</p>
                            <input type="text" name="phone2" placeholder="0000" maxLength="4" value={formData.phone2}
                                   onChange={handleChange} onBlur={handleBlur}/>
                            <p>-</p>
                            <input type="text" name="phone3" placeholder="0000" maxLength="4" value={formData.phone3}
                                   onChange={handleChange} onBlur={handleBlur}/>
                        </div>
                        <div className={singup.exception}>{errors.phone}</div>
                    </div>
                    <hr className={singup.signupline}/>

                    {/* Email */}
                    <div className={singup.formRow}>
                        <span>EMAIL</span>
                        <input className={singup.emaildetail} type="email" name="email" value={formData.email}
                               onChange={handleChange} onBlur={handleBlur}/>
                        <div className={singup.exception}>{errors.email}</div>
                    </div>
                    <hr className={singup.signupline}/>

                    {/* Buttons */}
                    <div className={singup.signupbtn}>
                        <button type="submit" className={singup.submitButton}>회원가입</button>
                        <Link to="/user">
                            <button type="reset" className={singup.submitButton}>취소</button>
                        </Link>
                    </div>
                </form>
            </div>
            <Footer/>
        </div>
    );
}

export default UserSignup;
