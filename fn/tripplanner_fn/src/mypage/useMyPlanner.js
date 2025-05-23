import { useState, useEffect } from "react";
import axios from "axios";

const useMyPlanner = () => {
  const [planners, setPlanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlanners = async () => {
    try {
      setLoading(true);
      console.log("플래너 요청 시작");
  
      const response = await axios.get(
        "http://localhost:9000/user/mypage/my-planners",
        {
          withCredentials: true,
        }
      );
  
      console.log("플래너 데이터 가져오기 성공:", response.data);
      setPlanners(response.data);
      setError(null); // 에러 초기화
    } catch (err) {
      console.error("플래너 데이터를 가져오는 중 오류:", err.response || err);
      setError("플래너 데이터를 가져오는 중 오류가 발생했습니다.");
    } finally {
      console.log("플래너 요청 종료");
      setLoading(false); // 로딩 종료
    }
  };
  

  useEffect(() => {
    fetchPlanners();
  }, []);

  return { planners, loading, error };
};

export default useMyPlanner;
