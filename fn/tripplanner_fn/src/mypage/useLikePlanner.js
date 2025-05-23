import { useState, useEffect } from "react";
import axios from "axios";

const useLikePlanner = (userid) => {
  const [likedPlanners, setLikedPlanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLikedPlanners = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:9000/user/mypage/liked-planners", {
          withCredentials: true,
        });
        setLikedPlanners(response.data);
      } catch (err) {
        console.error("❌ 좋아요한 플래너 로드 실패:", err);
        setError("좋아요한 플래너를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchLikedPlanners();
  }, []);

  return { likedPlanners, loading, error };
};


export default useLikePlanner;
