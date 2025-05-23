import { useState, useCallback, useEffect } from "react";
import axios from "axios";

const useAuthHandler = ({ setValidationMessages }) => {
  const [authCodeSent, setAuthCodeSent] = useState(false);
  const [isAuthCodeLocked, setIsAuthCodeLocked] = useState(false);
  const [isAuthCodeVerified, setIsAuthCodeVerified] = useState(false);
  const [timer, setTimer] = useState(180);

  useEffect(() => {
    if (authCodeSent && timer > 0 && !isAuthCodeVerified) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  
    if (timer === 0) {
      setValidationMessages((prev) => ({
        ...prev,
        authCode: "인증 시간이 만료되었습니다. 인증번호를 재발송하세요.",
        authCodeColor: "validation-error",
      }));
      setIsAuthCodeLocked(true); // 인증 잠금 처리
    }
  }, [authCodeSent, timer, isAuthCodeVerified, setValidationMessages]);

  const resetAuthState = useCallback(() => {
    setAuthCodeSent(false);
    setIsAuthCodeLocked(false);
    setIsAuthCodeVerified(false);
    setTimer(180);
    if (setValidationMessages) {
    setValidationMessages((prev) => ({
      ...prev,
      email: "",
      authCode: "",
    }));
  }
  }, [setValidationMessages]);

  const sendAuthCode = useCallback(async (email) => {
    if (!email) {
      setValidationMessages((prev) => ({
        ...prev,
        email: "이메일을 입력해주세요.",
        emailColor: "validation-error",
      }));
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:9000/user/send-auth-code", { email });
  
      if (response.data.status === "success") {
        setAuthCodeSent(true);
        setTimer(180); // 타이머를 초기화
        setIsAuthCodeLocked(false); // 인증 잠금 해제
  
        setValidationMessages((prev) => ({
          ...prev,
          email: authCodeSent
            ? "인증번호를 재발송하였습니다."
            : "인증 코드가 발송되었습니다.",
          emailColor: "validation-success",
        }));
      } else {
        setValidationMessages((prev) => ({
          ...prev,
          email: response.data.message || "인증 코드 발송 실패.",
          emailColor: "validation-error",
        }));
      }
    } catch (error) {
      console.error("인증 코드 요청 오류:", error.message);
      setValidationMessages((prev) => ({
        ...prev,
        email: "서버 오류로 인증 코드를 발송할 수 없습니다.",
        emailColor: "validation-error",
      }));
    }
  }, [authCodeSent, setValidationMessages]);
  

  const verifyAuthCode = useCallback(async (email, code) => {
    if (!email || !code) {
      setValidationMessages((prev) => ({
        ...prev,
        authCode: "이메일과 인증 코드를 올바르게 입력해주세요.",
        authCodeColor: "validation-error",
      }));
      return;
    }
    
    try {
      const response = await axios.post("http://localhost:9000/user/verify-auth-code", { email, code });

      if (response.data.message.includes("완료")) {
        setIsAuthCodeLocked(true);
        setIsAuthCodeVerified(true);
        
        setValidationMessages((prev) => ({
          ...prev,
          authCode: "인증이 완료되었습니다.",
          authCodeColor: "validation-success",
        }));
      } else {
        setValidationMessages((prev) => ({
          ...prev,
          authCode: "인증번호가 올바르지 않습니다.",
          authCodeColor: "validation-error",
        }));
      }
    } catch (error) {
      console.error("인증 코드 확인 중 오류 발생:", error.message);
      setValidationMessages((prev) => ({
        ...prev,
        authCode: "서버 오류로 인증을 완료할 수 없습니다.",
        authCodeColor: "validation-error",
      }));
    }
  }, [setValidationMessages]);

  //verifyAuthCode 호출 시 올바른 값만 전달하도록 보장합니다.
  const handleVerifyAuthCode = useCallback(
    (email, authCode) => {
      if (!email || !authCode) {
        setValidationMessages((prev) => ({
          ...prev,
          authCode: "이메일과 인증 코드를 입력해주세요.",
          authCodeColor: "validation-error",
        }));
        return;
      }
  
      verifyAuthCode(email, authCode);
    },
    [verifyAuthCode, setValidationMessages]
  );

  return {
    authCodeSent,
    isAuthCodeLocked,
    timer,
    sendAuthCode,
    verifyAuthCode,
    resetAuthState,
    handleVerifyAuthCode,
  };
};

export default useAuthHandler;
