import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import Summary from './Summary.jsx';
import DestinationDetails from './DestinationDetails.jsx';
import Comments from './Comments';
import '../css/Destination.scss';
import Destination from './Destination.jsx';

const Destination1 = () => {
    const location = useLocation();
    const plannerID = new URLSearchParams(location.search).get("plannerID");
    const { plannerItem } = location.state || {}; // state에서 데이터 가져오기 (Planner의 정보)
    const [destinations, setDestinations] = useState([]);
    const [loginStatus, setLoginStatus] = useState([]);
    const [activeTab, setActiveTab] = useState("summary");  // 현재 활성화된 탭을 관리

    useEffect(() => {
        // 데이터를 가져오는 로직
        axios.get(`http://localhost:9000/planner/board/destination?plannerID=${plannerID}`)
            .then((response) => {

                setDestinations(response.data);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });

        // 로그인 상태 확인
        axios.post('http://localhost:9000/api/cookie/validate', {}, { withCredentials: true })
            .then(response => setLoginStatus(response.data))
            .catch(error => setLoginStatus(error));
    }, []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="destination-wrapper">
            {/* 탭 버튼 */}

            <ul className="destinaion-depth">
                <li onClick={() => handleTabChange("summary")}>전체정보</li>
                <li onClick={() => handleTabChange("details")}>세부정보</li>
                <li onClick={() => handleTabChange("comments")}>댓글</li>
            </ul>



            {/* 탭에 따라 컴포넌트 렌더링 */}
            {activeTab === "summary" && <Destination plannerItem={plannerItem} />}
            {activeTab === "details" && <DestinationDetails plannerItem={plannerItem} destinations={destinations} />}
            {activeTab === "comments" && <Comments plannerItem={plannerItem} />}
        </div>
    );

}

export default Destination1;
