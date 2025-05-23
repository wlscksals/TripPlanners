import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";

const useFileAndImageHandler = (setFormData, userData) => {
  if (typeof setFormData !== "function") {
    throw new Error("setFormData는 반드시 함수여야 합니다.");
  }

  const userid = userData?.userid;
  const userImg = userData?.img || "/upload/basic/anonymous.jpg";
  const fullImgPath = `http://localhost:9000${userImg}`;

  const [imagePreview, setImagePreview] = useState(fullImgPath);

  useEffect(() => {
    setImagePreview(`http://localhost:9000${userData?.img || "/upload/basic/anonymous.jpg"}`);
  }, [userData]);

  const fileInputRef = useRef(null);

  const handleFileInputClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImagePreview = useCallback((file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleImageUpload = useCallback(async (file) => {
    if (!file || !userid) return;

    const formDataToSend = new FormData();
    formDataToSend.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:9000/user/mypage/upload",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.data === "파일 업로드 성공") {
        // 서버에는 상대경로 저장
        setFormData((prev) => ({
          ...prev,
          img: `/upload/profile/${userid}/${file.name}`,
        }));
      } else {
        console.error("이미지 업로드 실패:", response.data);
      }
    } catch (error) {
      console.error("이미지 업로드 중 오류 발생:", error);
    }
  }, [setFormData, userid]);

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file) {
        handleImagePreview(file);
        handleImageUpload(file);
      }
    },
    [handleImagePreview, handleImageUpload]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        handleImagePreview(file);
        handleImageUpload(file);
      }
    },
    [handleImagePreview, handleImageUpload]
  );

  const handleDragOver = useCallback((e) => e.preventDefault(), []);

  const handleCancelImage = () => {
    setImagePreview(`http://localhost:9000${userData?.img || "/upload/basic/anonymous.jpg"}`);
  };

  const handleResetToDefaultImage = () => {
    const defaultImage = "/upload/basic/anonymous.jpg";
    setImagePreview(`http://localhost:9000${defaultImage}`);
    setFormData((prev) => ({
      ...prev,
      img: defaultImage, // 서버에는 이 상대경로만 저장
    }));
  };

  return {
    imagePreview,
    setImagePreview,
    fileInputRef,
    handleFileInputClick,
    handleDrop,
    handleFileChange,
    handleDragOver,
    handleCancelImage,
    handleResetToDefaultImage,
  };
};

export default useFileAndImageHandler;
