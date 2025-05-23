import React, { useState, useEffect } from "react";
import axios from "axios";
import useMyPlanner from "./useMyPlanner";
import useLikePlanner from "./useLikePlanner";
import { useNavigate } from "react-router-dom";

const Planners = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");  // 현재 활성화된 탭을 관리
  const [destinations, setDestinations] = useState([]);

  const navigate = useNavigate();

  // 사용자 데이터 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true); // 로딩 시작
        console.log("사용자 데이터 요청 시작");

        // 쿠키 인증
        await axios.post(
          "http://localhost:9000/api/cookie/validate",
          {},
          { withCredentials: true }
        );

        // 사용자 정보 가져오기
        const userResponse = await axios.get(
          "http://localhost:9000/user/mypage",
          { withCredentials: true }
        );

        console.log("사용자 데이터 가져오기 성공:", userResponse.data);
        setUserData(userResponse.data); // 사용자 데이터 업데이트
      } catch (err) {
        console.error("사용자 데이터를 가져오는 중 오류:", err);
        setError("사용자 데이터를 가져오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false); // 로딩 종료
        console.log("사용자 데이터 요청 종료");
      }
    };

    fetchUserData();
  }, []);

  // 내가 만든 플래너와 좋아요한 플래너 데이터 가져오기
  const { planners, loading: plannersLoading, error: plannersError } = useMyPlanner();
  const { likedPlanners, loading: likeLoading, error: likeError } = useLikePlanner(userData?.userid);

  // 플래너 클릭 핸들러
  const handlePlannerClick = (plannerID) => {
    if (!planners || planners.length === 0) {
      console.warn("플래너 데이터가 초기화되지 않았습니다.");
      return;
    }

    const plannerItem = planners.find((item) => item.plannerID === plannerID);
    if (!plannerItem) {
      console.warn("PlannerID에 해당하는 플래너가 없습니다.");
      return;
    }

    navigate(`/destination?plannerID=${plannerID}`, { state: { plannerItem } });
  };

  // 로딩 상태
  if (loading || plannersLoading || likeLoading) return <div>로딩 중...</div>;

  // 에러 상태
  if (error || plannersError || likeError) return <div>오류가 발생했습니다.</div>;

  return (
    <div>
      <div className="my-planner-container">
        <h3>내가 만든 Planner 목록</h3>
        {planners?.length === 0 ? (
          <p>작성된 플래너가 없습니다.</p>
        ) : (
          <ul>
            {planners?.map((planner, index) => (
              <li key={planner.plannerID || index}
              className="planner-item"
               onClick={() => handlePlannerClick(planner.plannerID)}
              >
                <h4>{planner.plannerTitle}</h4>
                <p>PlannerID: {planner.plannerID}</p>
                <p>지역: {planner.area}</p>
                <p>여행 일수: {planner.day}일</p>
                <p>설명: {planner.description}</p>
                <p>생성 날짜: {planner.createAt}</p>
                <p>수정 날짜: {planner.updateAt}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2>좋아요한 플래너 목록</h2>
        {likeLoading ? (
          <p>좋아요한 플래너를 불러오는 중...</p>
        ) : likedPlanners.length === 0 ? (
          <p>좋아요한 플래너가 없습니다.</p>
        ) : (
          <ul>
            {likedPlanners.map((likedPlanners, index) => (
              <li
                key={likedPlanners.plannerID || index}
                className="planner-item"
                onClick={() => handlePlannerClick(likedPlanners.plannerID)}
              >
                <h4>{likedPlanners.plannerTitle}</h4>
                <p>PlannerID: {likedPlanners.plannerID}</p>
                <p>지역: {likedPlanners.area}</p>
                <p>여행 일수: {likedPlanners.day}일</p>
                <p>설명: {likedPlanners.description}</p>
                <p>생성 날짜: {likedPlanners.createdAt}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Planners;
