import { useCallback } from "react";
import axios from "axios";

const useSaveChanges = ({
  formData,
  setUserData,
  setIsEditing,
  isEmailEditing,
  isAuthCodeVerified,
  setValidationMessages
}) => {
  const handleSaveChanges = useCallback(async () => {
    try {
      
      if (isEmailEditing && !isAuthCodeVerified) {
        setValidationMessages((prev) => ({
          ...prev,
          email: "이메일 인증을 완료해야 변경할 수 있습니다.",
          emailColor: "validation-error",
        }));
        alert("이메일 인증을 완료해야 변경할 수 있습니다.");
        return;
      }

      console.log("📤 전송할 데이터:", formData);

      const res = await axios.put(
        "http://localhost:9000/user/mypage/userupdate",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ 응답 데이터:", res.data);

      if (res.data.success) {
        setUserData(res.data.user);
        setIsEditing(false);
        alert(res.data.message || "정보가 성공적으로 저장되었습니다.");
      } else {
        const errorMsg = res.data.message || "알 수 없는 오류가 발생했습니다.";
        alert("정보 저장 실패: " + errorMsg);
      }
    } catch (error) {
      console.error("❌ 저장 요청 중 에러 발생:", error);
      alert("정보 저장 중 오류 발생: " + (error.response?.data?.message || error.message));
    }
  }, [formData, isEmailEditing, isAuthCodeVerified, setValidationMessages, setUserData, setIsEditing]);

  return { handleSaveChanges };
};

export default useSaveChanges;
