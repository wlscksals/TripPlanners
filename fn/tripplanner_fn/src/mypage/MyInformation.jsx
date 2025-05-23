import React, { useState, useEffect } from "react";
import axios from "axios";
import useFileAndImageHandler from "./useFileAndImageHandler";
import useValidationHandler from "./useValidationHandler";
import useAuthHandler from "./useAuthHandler";
import useSaveChanges from "./useSaveChanges";
import useFormDataHandler from "./useFormDataHandler";
import "./Mypage.scss";



const MyInformation = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [isEmailEditing, setIsEmailEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [isAuthCodeVerified, setIsAuthCodeVerified] = useState(false);
  

  // 초기 데이터 준비
  const initialUserData = userData
    ? {
        userid: userData.userid || "",
        username: userData.username || "",
        email: userData.email || "",
        img: userData.img || "/upload/basic/anonymous.jpg",
      }
    : {
        userid: "",
        username: "",
        email: "",
        img: "/upload/basic/anonymous.jpg",
      };

     
      const {
        validationMessages,
        setValidationMessages,
        validatePassword,
        validateEmail,
        validateUsername,
      } = useValidationHandler(initialUserData);

      // ✅ 4. 이메일 인증 관련
      const {
        authCodeSent,
        isAuthCodeLocked,
        timer,
        sendAuthCode,
        verifyAuthCode,
        resetAuthState,
        handleVerifyAuthCode,
      } = useAuthHandler({ setValidationMessages });
    


       // ✅ 2. formDataHandler에 validateUsername 전달
      const {
        formData,
        setFormData,
        resetFormData,
        updateFormData,
        handleEmailChange,
        handleUsernameChange,
        handleChange,
        handlePasswordChange,
        handleAuthCodeVerification,
        // handleSendAuthCode,
      } = useFormDataHandler(validateUsername, setValidationMessages,resetAuthState);

      
      const {
        imagePreview,
        fileInputRef,
        handleFileInputClick,
        handleFileChange,
        handleCancelImage,
        handleResetToDefaultImage,
        handleDrop,
        setImagePreview,
        handleDragOver,
      } = useFileAndImageHandler(setFormData, userData);
    
 
      

    // ✅ 5. 저장 핸들러
    const { handleSaveChanges } = useSaveChanges({
      formData,
      setUserData,
      setIsEditing,
      isEmailEditing,
      isAuthCodeVerified,
      setValidationMessages,
    });




  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        await axios.post(
          "http://localhost:9000/api/cookie/validate",
          {},
          { withCredentials: true }
        );

        const userResponse = await axios.get(
          "http://localhost:9000/user/mypage",
          { withCredentials: true }
        );
        setUserData(userResponse.data); // userData 설정
        console.log("1.Mypage", userResponse.data); // 디버깅 추가
        setFormData({
          img: userResponse.data.img || "/upload/basic/anonymous.jpg",
          userid: userResponse.data.userid || "",
          username: userResponse.data.username || "",
          email: userResponse.data.email || "",
          gender: userResponse.data.gender || "",
        });
        setLoading(false);
      } catch (err) {
        setError("사용자 데이터를 가져오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleCancelChanges = () => {
    if (userData) {
      setFormData({
        img: userData.img || "/upload/basic/anonymous.jpg",
        userid: userData.userid || "",
        username: userData.username || "",
        email: userData.email || "",
      });
    }
    setIsEditing(false); // 수정 모드 종료
  };

  // 수정 버튼 클릭 시 현재 프로필 이미지를 미리보기로 설정
  const handleEditClick = () => {
    if (userData) {
      setImagePreview(
        userData.img
          ? `http://localhost:9000${userData.img}`
          : "/upload/basic/anonymous.jpg"
      );
      setFormData({
        img: userData.img || "/upload/basic/anonymous.jpg",
        userid: userData.userid || "",
        username: userData.username || "",
        email: userData.email || "",
      });
    }
    setIsEditing(true); // 수정 모드 활성화
  };

  // 비밀번호 편집 모드
  const handlePasswordEditClick = () => {
    setIsPasswordEditing(true);
    setIsEmailEditing(false); // 이메일 수정 모드 비활성화
    setFormData((prev) => ({
      ...prev,
      password: "",
      repassword: "",
    }));
  };

  const handleCancelPasswordEditing = () => {
    setIsPasswordEditing(false);
    setFormData((prev) => ({
      ...prev,
      password: "",
      repassword: "",
    }));
    setValidationMessages((prev) => ({
      ...prev,
      password: "",
      repassword: "",
    }));
  };

  // 이메일 편집 취소
  const cancelEmailEditing = () => {
    setIsEmailEditing(false);
    setFormData((prev) => ({
      ...prev,
      email: userData.email,
    }));
    resetAuthState();
  };

  const handleDelet = async () => {
    if (!window.confirm("정말로 회원탈퇴를 하시겠습니까?")) {
      return;
    }

    try {
      const response = await axios.delete(
        "http://localhost:9000/user/mypage/delete",
        {
          withCredentials: true, // 쿠키 인증 정보를 함께 보냄
        }
      );

      if (response.status === 200) {
        alert("회원탈퇴가 완료되었습니다.");
        // 로그아웃 처리 및 리다이렉트
        setUserData(null); // 유저 데이터를 초기화
        window.location.href = "/"; // 홈 페이지로 리다이렉트
      }
    } catch (error) {
      console.error("회원탈퇴 중 오류 발생:", error);
      alert("회원탈퇴 중 문제가 발생했습니다. 다시 시도해주세요.");
    }
  };


  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;
  if (!userData) return <div>데이터를 불러오지 못했습니다.</div>;


  return (
    <div className="mypage-container">
      <h1 className="mypage-title">{userData.username}님의 마이페이지</h1>
      <div className="mypage-grid">
        {isEditing ? (
          <>
          <div className="left-section">
            <div
              className="image-preview-container"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <img
                src={imagePreview}
                alt="미리보기"
                className="circle-preview"
                style={{ width: "150px", height: "150px", borderRadius: "50%" }}
              />
            </div>
            <div id="imgbutton">
              <button type="button" onClick={handleFileInputClick}>
                이미지 업로드
              </button>
              <button type="button" onClick={handleCancelImage}>
                이미지 취소
              </button>
              <button type="button" onClick={handleResetToDefaultImage}>
                기본 이미지로 변경
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          </div>

            {/* Username */}
          <div className="right-section">
            <div className="field">
              <input
                type="text"
                name="username"
                placeholder="이름"
                value={formData.username}
                onChange={handleUsernameChange}
              />
              {validationMessages.username && (
                <div
                  className={`validation-message ${validationMessages.usernameColor}`}
                >
                  {validationMessages.username}
                </div>
              )}
          </div>

            {/* Email */}
            <div className="field">
              <div
                className={`emailbox ${
                  validationMessages.email ? "has-message" : ""
                }`}
              >
                <div className="email-wrapper">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="이메일 입력"
                    onChange={handleEmailChange}
                    disabled={!isEmailEditing}
                  />
                  {isEmailEditing ? (
                    <>
                      <button type="button" onClick={() => sendAuthCode(formData.email)}>
                        인증 코드 받기
                      </button>
                      <button type="button" onClick={cancelEmailEditing}>
                        취소
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setIsEmailEditing(true)}>
                      이메일 수정
                    </button>
                  )}
                </div>
                {validationMessages.email && (
                  <div
                    className={`validation-message ${validationMessages.emailColor}`}
                  >
                    {validationMessages.email}
                  </div>
                )}
              </div>

              {/* Auth Code */}
              {authCodeSent &&
                validationMessages.emailColor === "validation-success" && (
                  <div className="auth-codebox">
                    <div className="auth-code-wrapper">
                      <input
                        type="text"
                        name="authCode"
                        placeholder="인증 코드 입력"
                        value={formData.authCode}
                        onChange={handleChange}
                        disabled={isAuthCodeLocked}
                      />
                      <div id="timer">
                        {Math.floor(timer / 60)}:
                        {String(timer % 60).padStart(2, "0")}
                      </div>
                      <button
                        type="button"
                        onClick={handleAuthCodeVerification}
                        disabled={isAuthCodeLocked}
                      >
                        인증 코드 확인
                      </button>
                    </div>
                    {validationMessages.authCode && (
                      <div
                        className={`validation-message ${validationMessages.authCodeColor}`}
                      >
                        {validationMessages.authCode}
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* Password */}
            <div className="field">
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={formData.password}
              onChange={handlePasswordChange}
              disabled={!isPasswordEditing} // 잠금 상태 제어
            />

            {isPasswordEditing && validationMessages.password && (
              <div
                className={`validation-message ${validationMessages.passwordColor}`}
              >
                {validationMessages.password}
              </div>
            )}
          </div>

            {/* Confirm Password */}
            {isPasswordEditing && (
              <input
                type="password"
                name="repassword"
                value={formData.repassword}
                placeholder="비밀번호 확인"
                onChange={handlePasswordChange}
              />
            )}
            {isPasswordEditing && validationMessages.repassword && (
              <div
                className={`validation-message ${validationMessages.repasswordColor}`}
              >
                {validationMessages.repassword}
              </div>
            )}

            {/* Buttons */}
            <div>
              {!isPasswordEditing ? (
                <button type="button" onClick={handlePasswordEditClick}>
                  비밀번호 변경
                </button>
              ) : (
                <button type="button" onClick={handleCancelPasswordEditing}>
                  변경 취소
                </button>
              )}
            </div>
          </div>
            <div>
              <button type="button" onClick={handleSaveChanges}>
                유저 정보 변경
              </button>
              <button type="button" onClick={handleCancelChanges}>
                취소
              </button>
            </div>
          </>
          
        ) : (
          <>
            <div className="left-section">
              <div className="image-wrapper">
                <img
                  src={
                    userData.img
                      ? `http://localhost:9000${userData.img}`
                      : "/upload/basic/anonymous.jpg"
                  }
                  alt="프로필 사진"
                  className="profile-img"
                />
              </div>
            </div>
            <div className="right-section">
              <p>아이디: {userData.userid}</p>
              <p>이메일: {userData.email}</p>
              <p>성별 : {userData.gender}</p>
              <p>생년월일 : {userData.birth}</p>
            </div>
            <div className="buttons">
              <button type="button" onClick={handleEditClick}>
                수정
              </button>
              <button type="button" onClick={handleDelet}>
                회원탈퇴
              </button>
            </div>  
          </>
        )}
      </div>
    </div>
  );
};

export default MyInformation;
