import { useState, useCallback } from "react";

const useFormDataHandler = (validateUsername, setValidationMessages,resetAuthState) => {
  // 기본 폼 데이터
  const defaultFormData = {
    userid: "",
    username: "",
    email: "",
    img: "/upload/basic/anonymous.jpg",
    password: "",
    repassword: "",
    authCode: "",
  };

  // 상태 관리
  const [formData, setFormData] = useState({ ...defaultFormData });

  // 유저 정보 변경 취소 시 상태 초기화
  const resetFormData = useCallback(() => {
    setFormData({ ...defaultFormData }); // 기본값으로 초기화
  }, []);

  // 특정 필드를 업데이트
  const updateFormData = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // 이메일 변경 핸들러
  const handleEmailChange = useCallback((e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      email: value,
    }));


    if (typeof resetAuthState === "function") {
      resetAuthState(); // 이메일 인증 상태 초기화 // 안전하게 호출
    }
  

    
    setValidationMessages((prev) => ({
      ...prev,
      email: "",
      authCode: "",
    }));
  },
  [resetAuthState, setValidationMessages]);

    // ✅❗ 비밀번호 변경 핸들러 (함수 위치 수정)
    const handlePasswordChange = useCallback((e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }, []);

  

  // 이름 변경 핸들러
 const handleUsernameChange = useCallback(
  (e) => {
    const { value } = e.target;

    // formData 업데이트
    setFormData((prev) => ({ ...prev, username: value }));

    // 이름 유효성 검사
    const validationResult = validateUsername(value);
    setValidationMessages((prev) => ({
      ...prev,
      username: validationResult.message,
      usernameColor: validationResult.color,
    }));
  },
  [setFormData, validateUsername, setValidationMessages] // 의존성 배열
);



  // 일반 입력값 변경 핸들러
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  return {
    formData,
    setFormData,
    resetFormData, // 초기화 메서드
    updateFormData,
    handleEmailChange,
    handleUsernameChange,
    handleChange,
    handlePasswordChange,
  };
};

export default useFormDataHandler;
