import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "react-modal";
import styles from "../../assets/css/Mypage_profile.module.css";
import Banner from "../../components/Banner/banner";
import Footer from "../../components/Footer/Footer";
import { PATH } from '../../../scripts/path';

const MypageProfile = () => {
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

    const [userInfo, setUserInfo] = useState(null); // 사용자 정보 저장
    const [errors, setErrors] = useState({});
    const [showTooltip, setShowTooltip] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = "이름을 입력해 주세요.";
        if (!formData.email) newErrors.email = "이메일을 입력해 주세요.";
        if (!formData.phone1 || !formData.phone2 || !formData.phone3) {
            newErrors.phone = "전화번호를 입력해 주세요.";
        }
        if (!formData.pwd) newErrors.pwd = "비밀번호를 입력해 주세요.";
        if (formData.pwd !== formData.confirmPwd) {
            newErrors.confirmPwd = "비밀번호가 일치하지 않습니다.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        updateFormData(name, value);
    };

    const handleBlur = () => {
        if (formData.pwd && formData.confirmPwd && formData.pwd !== formData.confirmPwd) {
            setErrors((prevErrors) => ({ ...prevErrors, confirmPwd: "비밀번호가 일치하지 않습니다." }));
        } else {
            setErrors((prevErrors) => ({ ...prevErrors, confirmPwd: "" }));
        }
    };

    // 회원정보 수정
    const handleSubmit = (e) => {
        e.preventDefault();  // 폼 제출 기본 동작 방지
    
        if (!validateForm()) return;  // 유효성 검사를 통과하지 못하면 서버로 전송하지 않음
    
        const token = localStorage.getItem("accessToken"); // 로컬 스토리지에서 토큰을 가져옴
        const userId = formData.userId; // 수정할 사용자 ID
        const phone = `${formData.phone1}${formData.phone2}${formData.phone3}`; // 전화번호 합치기
    
        // 서버로 전송할 데이터 준비
        const updateData = {
            userId,
            name: formData.name,
            gender: formData.gender,
            address: formData.addr1, // 기본 주소
            zipcode: formData.zipcode, // 우편번호
            addr1: formData.addr1, // 기본 주소
            addr2: formData.addr2, // 상세 주소
            tel: phone, // 전화번호
            email: formData.email,
            pwd: formData.pwd, // 비밀번호
            height: formData.height, // 키
            weight: formData.weight, // 몸무게
            birth: formData.birth, // 생일
        };

        console.log("phone = " + phone);
        console.log("birth = " + formData.birth);
        console.log("updateData = " + updateData);
        // 서버로 데이터 전송
        fetch(`${PATH.SERVER}/api/user/mypage/update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updateData), // 수정된 데이터 전송
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("회원정보 수정에 실패했습니다.");
                }
                return response.text();
            })
            .then((data) => {
                alert("회원정보가 성공적으로 수정되었습니다!");
                navigate("/mypage"); // 수정 후 마이페이지로 이동
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("회원정보 수정 중 오류가 발생했습니다.");
            });
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

    const handleMouseEnter = () => setShowTooltip(true);
    const handleMouseLeave = () => setShowTooltip(false);

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const handleDeletePasswordChange = (e) => setDeletePassword(e.target.value);

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            alert("비밀번호를 입력해주세요.");
            return;
        }
    
        const token = localStorage.getItem("accessToken");
        const userId = parseInt(localStorage.getItem("id"));
    
        if (!token || isNaN(userId)) {
            alert("로그인이 필요합니다. 다시 로그인해주세요.");
            navigate("/login");
            return;
        }
    
        try {
            const response = await fetch(`${PATH.SERVER}/api/user/mypage/delete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Authorization 헤더 설정
                },
                body: JSON.stringify({
                    userId: userId, // userId 전달
                    pwd: deletePassword, // 입력받은 비밀번호 전달
                }),
            });
    
            if (response.status === 403) {
                alert("권한이 없거나 비밀번호가 일치하지 않습니다.");
                return;
            }
    
            if (response.status === 500) {
                alert("서버에서 오류가 발생했습니다. 다시 시도해주세요.");
                return;
            }
    
            if (response.ok) {
                alert("회원 탈퇴가 완료되었습니다.");
                localStorage.clear(); // 로그아웃 처리
                navigate("/"); // 홈으로 이동
            } else {
                alert("탈퇴에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("Account deletion error:", error);
            alert("예기치 못한 오류가 발생했습니다. 다시 시도해주세요.");
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
            bitrh: userInfo?.bitrh || "",
            height: userInfo?.height || "",
            weight: userInfo?.weight || "", 
        });
        alert("수정이 취소되었습니다.");
    };

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const id = localStorage.getItem("id");
    
        if (!token || !id) {
            alert("로그인이 필요합니다.");
            navigate("/user");
            return;
        }
    
        // Fetch user info
        fetch(`${PATH.SERVER}/api/user/mypage/info/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`, // 인증 토큰 전달
            },
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("사용자 정보를 가져오지 못했습니다.");
            }
            return response.json();
        })
        .then((data) => {
            // Split the phone number into parts
            const { phone1, phone2, phone3 } = splitPhoneNumber(data.tel);
    
            setUserInfo(data);
            setFormData({
                userId: data.userId,
                name: data.name,
                gender: data.gender,
                zipcode: data.zipcode,
                addr1: data.addr1,
                addr2: data.addr2,
                phone1,
                phone2,
                phone3,
                email: data.email,
                height: data.height,
                weight: data.weight,
                coupon: data.coupons,
                birth: data.birth,
            });
        })
        .catch((error) => {
            console.error("Error fetching user info:", error);
            alert("사용자 정보를 가져오는 중 오류가 발생했습니다.");
        });
    }, [navigate]);
    console.log(formData);

    const splitPhoneNumber = (tel) => {
        if (!tel) return { phone1: "", phone2: "", phone3: "" };
        const phoneParts = tel.match(/^(\d{3})(\d{4})(\d{4})$/);
        console.log(phoneParts);
        return phoneParts ? { phone1: phoneParts[1], phone2: phoneParts[2], phone3: phoneParts[3] } : { phone1: "", phone2: "", phone3: "" };
    };

    return (
            <div>
                <Banner />
                <div className={styles.profileContainer}>      
                    <div className={styles.pageName}>PROFILE</div>
                    <button className={styles.deleteButton} onClick={handleOpenModal}>
                        회원 탈퇴
                    </button>
                           {/* 멤버십 박스 */}
                    <div className={styles.membershipBox}>
                    <div className={styles.membershipImage}>
                        <img src="../image/level5.png" alt="Profile" />
                    </div>
                    <div>
                        <div className={styles.membershipInfo}>
                        {userInfo ? (
                            <>
                                <p>{userInfo.name}님의 멤버십 등급은 <strong>[ {userInfo.grade} ]</strong>입니다.</p>
                                {userInfo.nextLevelTarget === 0 ? (
                                <strong><p></p></strong>
                                ) : (
                                <p>
                                    다음 등급까지 남은 구매금액은 
                                    <strong> KRW {userInfo.nextLevelTarget.toLocaleString()}원</strong>입니다.
                                </p>
                                )}
                                <p>
                                키: <strong>{userInfo.height}cm</strong> &nbsp;
                                몸무게: <strong>{userInfo.weight}kg</strong>
                                </p>
                            </>
                            ) : (
                            "사용자 정보를 불러오는 중입니다..."
                            )}
                        </div>
                        <div className={styles.couponSection}>
                            <div className={styles.coupon}>
                                COUPON: &nbsp;
                                {userInfo && userInfo.coupons ? (
                                userInfo.coupons.map((coupon, index) => (
                                    <strong key={index}>{coupon.name}</strong>
                                ))
                                ) : (
                                "쿠폰 정보를 불러오는 중입니다..."
                                )}
                            </div>
                        </div>
                    </div>
                    <Modal 
                        isOpen={showModal} 
                        onRequestClose={handleCloseModal}
                        contentLabel="회원 탈퇴 확인"
                        className={styles.modal}
                        overlayClassName={styles.overlay}
                    >
                        <div className={styles.modalContent}>
                            <h2>회원 탈퇴</h2>
                            <p>회원 탈퇴를 위해 비밀번호를 입력해 주세요.</p>
                            <input 
                                type="password" 
                                value={deletePassword} 
                                onChange={handleDeletePasswordChange} 
                                placeholder="비밀번호" 
                                className={styles.inputtext}
                            />
                            <div className={styles.modalButtons}>
                                <button onClick={handleDeleteAccount} className={styles.confirmButton}>탈퇴</button>
                                <button onClick={handleCloseModal} className={styles.cancelButton2}>취소</button>
                            </div>
                        </div>
                    </Modal>
                        </div>
                            {/* 아이콘 영역 (우측 상단에 배치) */}
                            <div 
                            className={styles.tooltipIcon} 
                            onMouseEnter={handleMouseEnter} 
                            onMouseLeave={handleMouseLeave}
                            >
                            <img src="../image/info.png" alt="Info Icon"/>
                            {showTooltip && (
                                <div className={styles.tooltip}>
                                <p>
                                    LV 1 : 일반회원<br />
                                    LV 2: 월 구매 10만원 이상<br />
                                    LV 3: 월 구매 30만원 이상<br />
                                    LV 4: 월 구매 50만원 이상<br />
                                    LV 5: 월 구매 70만원 이상<br /><br/>
                                    <strong>LV 2 혜택:</strong> LV2 전용 15% 할인 쿠폰<br />
                                    <strong>LV 3 혜택:</strong> LV3 전용 20% 할인 쿠폰<br />
                                    <strong>LV 4 혜택:</strong> LV4 전용 25% 할인 쿠폰<br />
                                    <strong>LV 5 혜택:</strong> LV5 전용 30% 할인 쿠폰<br />
                                
                                </p>
                                </div>
                            )}
                        </div>
                <form className={styles.signupForm} onSubmit={handleSubmit}>
                    {/* ID */}
                    <div className={styles.formRow}>
                        <span>ID</span>
                        <input type="text" name="userId" value={formData.userId} readOnly/>
                    </div>
                    <hr className={styles.signupline} />

                    {/* Password */}
                    <div className={styles.formRow}>
                        <span>PASSWORD</span>
                        <input type="password" name="pwd" value={formData.pwd} onChange={handleChange} />
                    </div>
                    {errors.pwd && <p className={styles.errorText}>{errors.pwd}</p>}
                    <hr className={styles.signupline} />

                    {/* Confirm Password */}
                    <div className={styles.formRow}>
                        <span>CONFIRM PASSWORD</span>
                        <input type="password" name="confirmPwd" value={formData.confirmPwd} onChange={handleChange} />
                    </div>
                    {errors.confirmPwd && <p className={styles.errorText}>{errors.confirmPwd}</p>}
                    <hr className={styles.signupline} />

                    {/* Name */}
                    <div className={styles.formRow}>
                        <span>NAME</span>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} />
                    </div>
                    {errors.name && <p className={styles.errorText}>{errors.name}</p>}
                    <hr className={styles.signupline} />

                    {/* Gender */}
                    <div className={styles.formRow}>
                        <span>GENDER</span>
                        <div className={styles.radioContainer}>
                            <input type="radio" name="gender" value="M" checked={formData.gender === "M"} onChange={handleChange} /> Male
                            <input type="radio" name="gender" value="F" checked={formData.gender === "F"} onChange={handleChange} /> Female
                        </div>
                    </div>
                    <hr className={styles.signupline} />

                    {/* Address */}
                    <div className={styles.formRow}>
                        <span>ADDRESS</span>
                        <div className={styles.addressContainer}>
                            <div className={styles.postalRow}>
                                <input type="text" name="zipcode" placeholder="우편번호" value={formData.zipcode} onChange={handleChange} required/>
                                <button type="button" onClick={handleFindPostalCode} className={styles.findButton}>우편번호 찾기</button>
                            </div>
                            <input type="text" name="addr1" placeholder="기본 주소" value={formData.addr1} onChange={handleChange} required/>
                            <input type="text" name="addr2" placeholder="상세 주소" value={formData.addr2} onChange={handleChange} />
                        </div>
                    </div>
                    <hr className={styles.signupline} />

                    {/* Phone */}
                    <div className={styles.formRow}>
                        <span>PHONE</span>
                        <div className={styles.phoneRow}>
                            <input type="text" name="phone1" maxLength="3" value={formData.phone1} onChange={handleChange} />
                            <p>-</p>
                            <input type="text" name="phone2" maxLength="4" value={formData.phone2} onChange={handleChange} />
                            <p>-</p>
                            <input type="text" name="phone3" maxLength="4" value={formData.phone3} onChange={handleChange} />
                        </div>
                    </div>
                    {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
                    <hr className={styles.signupline} />

                    {/* Email */}
                    <div className={styles.formRow}>
                        <span>EMAIL</span>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} />
                    </div>
                    {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                    <hr className={styles.signupline} />

                    {/* BIRTH */}
                    <div className={styles.formRow}>
                        <span>BIRTH</span>
                        <div className={styles.birthRow}>
                            <input
                                className={styles.inputtext}
                                type="date"
                                name="birth"
                                value={formData.birth}
                                onChange={handleChange}
                            />  
                        </div>               
                    </div>
                    <hr className={styles.signupline} />
                    {/* HEIGHT */}
                    <div className={styles.formRow}>
                        <span>WEIGHT (cm):</span>
                        <div className={styles.weightRow}>
                            <input
                                className={styles.inputtext2}
                                type="number"
                                id="height"
                                name="height"
                                value={formData.height}
                                placeholder="예: 170"
                                onChange={handleChange}
                            />
                        </div>
                    </div>  
                     <hr className={styles.signupline} />
                     {/* WEIGHT */}
                     <div className={styles.formRow}>
                        <span>WEIGHT (cm):</span>
                        <div className={styles.weightRow}>
                            <input
                                className={styles.inputtext2}
                                type="number"
                                id="weight"
                                name="weight"
                                value={formData.weight}
                                placeholder="예: 100"
                                onChange={handleChange}
                            />
                        </div>
                    </div>         
                    <hr className={styles.signupline} />
                    
                    {/* Buttons */}
                    <div className={styles.buttonRow}>
                        <button type="submit" className={styles.submitButton}>회원정보 수정</button>
                        <button type="button" className={styles.cancelButton} onClick={handleCancel}>
                        취소
                        </button>
                    </div>
                </form>

                <div className={styles.bottomBar}></div>
                <Link to="/mypage" className={styles.backLink}>Go Back to MyPage</Link>
            </div>
            <Footer />
        </div>
    );
};

export default MypageProfile;
