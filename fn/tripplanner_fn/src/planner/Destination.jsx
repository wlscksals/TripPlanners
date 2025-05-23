
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Destination.scss';
import findwayIcon from '../images/findway.png';
import likeIcon from '../images/likeIcon.png';
import moment from 'moment';

const Destination = () => {
    const dayColors = [
        "#FF5733", "#33FF57", "#3357FF", "#F0E68C", "#FF1493", "#8A2BE2", "#FFD700", "#FF6347", "#00FA9A", "#ADFF2F"
    ];

    const location = useLocation();
    const plannerID = new URLSearchParams(location.search).get("plannerID");

    const [destinations, setDestinations] = useState([]);
    const [username, setUsername] = useState('');
    const { plannerItem } = location.state || {}; // state에서 데이터 가져오기 (Planner의 정보)
    const [shownDays, setShownDays] = useState([]);
    const [loginStatus, setLoginStatus] = useState([]);
    console.log('plannerItem : ', plannerItem);

    // 거리 계산 함수: 두 좌표 간의 거리 계산 (단위: km)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // 지구 반경 (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // km 단위 반환
    };

    // 카카오 지도로 길찾기 (새 페이지)
    const getDirections = (start, end) => {
        const endAddress = start.address; // 출발지 좌표
        const startAddress = end.address; // 도착지 좌표

        // 카카오 지도 경로 요청 URL 
        const url = `https://map.kakao.com/?sName=${endAddress}&eName=${startAddress}`
        return url;
    };

    // destination 데이터를 서버에서 가져오는 API 호출
    useEffect(() => {
        if (plannerID) {
            axios.get(`http://localhost:9000/planner/board/destination?plannerID=${plannerID}`)
                .then((response) => {
                    setUsername(response.data[0].username);
                    setDestinations(response.data);
                })
                .catch((error) => {
                    console.error("Error fetching destinations:", error);
                });

            // 쿠키요청
            axios.post('http://localhost:9000/api/cookie/validate', {}, {
                withCredentials: true, // 쿠키 포함
            })
                .then(response => {
                    console.log(response)
                    setLoginStatus(response.data);
                })
                .catch(error => {
                    setLoginStatus(error);
                    console.log('로그인 정보 없음')
                })
        }

    }, [plannerID]);

    useEffect(() => {

        const uniqueDays = destinations.reduce((acc, destination) => {
            if (!acc.includes(destination.day)) acc.push(destination.day);
            return acc;
        }, []);

        setShownDays(uniqueDays);

        if (destinations.length > 0) {
            const container = document.getElementById('main-map');
            
            // 이미 지도 객체가 초기화 되어 있는지 체크
            if (window.kakao && window.kakao.maps && !window.kakao.maps.Map) {
                return;  // 카카오 맵 객체가 로드되지 않았다면 초기화하지 않음
            }
    
            const options = {
                center: new window.kakao.maps.LatLng(destinations[0].y, destinations[0].x),
                level: 5
            };
    
            // 맵 객체를 한 번만 초기화하고, 이미 초기화된 맵이 있다면 재사용
            const map = new window.kakao.maps.Map(container, options);
            const bounds = new window.kakao.maps.LatLngBounds();
            let dayMarkers = {}; 
            let dayPolylines = {}; 
            let dayCounters = {};
    
            destinations.forEach((destination, index) => {
                const position = new window.kakao.maps.LatLng(destination.y, destination.x);
                bounds.extend(position);
    
                const currentDay = destination.day;
                const color = dayColors[(currentDay - 1) % dayColors.length];
    
                if (!dayCounters[currentDay]) {
                    dayCounters[currentDay] = 1;
                } else {
                    dayCounters[currentDay] += 1;
                }
    
                const customOverlayContent = `
                    <div style="font-size: 16px; font-weight: bold; background-color: ${color}; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; cursor: pointer; z-index: 100; color: white;">
                        ${dayCounters[currentDay]}
                    </div>
                `;
    
                const customOverlay = new window.kakao.maps.CustomOverlay({
                    position, content: customOverlayContent, clickable: true
                });
                customOverlay.setMap(map);
    
                if (!dayMarkers[currentDay]) {
                    dayMarkers[currentDay] = [];
                }
                dayMarkers[currentDay].push(position);
    
                if (dayMarkers[currentDay].length > 1) {
                    if (!dayPolylines[currentDay]) {
                        dayPolylines[currentDay] = new window.kakao.maps.Polyline({
                            path: dayMarkers[currentDay],
                            strokeWeight: 5,
                            strokeColor: color,
                            strokeOpacity: 0.7,
                            strokeStyle: 'solid',
                        });
                        dayPolylines[currentDay].setMap(map);
                    } else {
                        dayPolylines[currentDay].setPath(dayMarkers[currentDay]);
                    }
                }
            });
    
            map.setBounds(bounds);
        }
        console.log('destinations : ', destinations);
    }, [destinations]);

    const navigate = useNavigate();
    // 클릭 시 
    const desInfoClick = (item) => {

        axios.post(`http://localhost:9000/destination-to-tourist`, {
            mapX: item.x,
            mapY: item.y
        }).then((response) => {

            if (response.data.items.item[0].contentid) {
                const contentId = response.data.items.item[0].contentid;
                axios.get(`http://localhost:9000/tourist-info?id=${contentId}`)
                    .then((response) => {

                        const detailCommon = response.data;

                        navigate('/tourist-info', { state: { detailCommon } }); // 데이터와 함께 이동

                    })
                    .catch((error) => {
                        console.error('Error fetching course info:', error);

                    });

            }

            console.log(response.data.items.item[0]);
        }).catch(() => {
            // 데이터가 없으면 카카오지도에 장소 이름으로 검색
            const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(item.name)}`;
            window.open(kakaoMapUrl, '_blank'); // 새 탭으로 카카오 지도 열기

        })

    }

    const addressClick = (item) => {
        const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(item.address)}`;
        window.open(kakaoMapUrl, '_blank');
    }


    const [likeCount, setLikeCount] = useState(0);

    const handleLike = (plannerID) => {
        // 좋아요 증가/감소 처리 (간단한 토글)
        setLikeCount((prev) => prev + 1);

    };

    // 내 코스로 담기 버튼
    const handleAddToMyCourse = () => {

        axios.post('http://localhost:9000/api/cookie/validate', {}, {
            withCredentials: true, // 쿠키 포함
        })
            .then(response => {
                console.log("쿠키 보내기:", response.data);
                // 보낼 데이터 준비
                const requestData = {
                    title: plannerItem.plannerTitle,
                    area: plannerItem.area,
                    description: plannerItem.description,
                };

                // 쿠키요청
                axios.post('http://localhost:9000/planner/add-to-my-course', requestData)
                    .then((response) => {
                        alert(response.data); // 서버에서 보낸 응답 메시지 출력
                    })
                    .catch((error) => {
                        console.error("Error adding to my course:", error);
                        alert("내 코스로 저장에 실패했습니다. 다시 시도해주세요.");
                    });
            })

            .catch(error => {
                alert('로그인이 필요한 서비스입니다!');
                window.location.href = "/user/login";
            });


    }

    return (
        // 페이지 전체
        <>

            {/* 페이지 설명 컨탠트 */}
            < div className="destination-content" >

                {/* 설명 부분 */}
                < div className="destination-topcard" >

                    {/* 설명의 헤더 */}
                    < div className="topcard-header" >
                        {/* 플래너 타이틀 */}
                        <div div className="topcard-title" > {plannerItem.plannerTitle}</div>

                        {/* 타이틀 바로 밑 서브헤더 */}
                        < div className="topcard-subheader" >
                            <span>{plannerItem.area}</span>

                            {/* 기간 : */}
                            <span className="topcard-day">
                                {plannerItem.day === 1
                                    ? "당일"
                                    : `${plannerItem.day - 1}박 ${plannerItem.day}일`}
                            </span>

                            {/* 공개 여부 */}
                            {
                                plannerItem ? (
                                    <span className="topcard-isPublic">공개</span>
                                ) :
                                    <span className="topcard-isPublic">비공개</span>
                            }


                        </div>
                    </div >

                    {/* 코스에대한 설명이 담긴 부분 */}
                    < div className="topcard-main" >
                        <div>설명 : {plannerItem.description}</div>
                    </div >

                    {/* 좋아요와 작성일이 담긴 부분 */}
                    < div className="topcard-footer" >

                        {/* 좋아요 */}
                        < div className="like-section" >
                            <img src={likeIcon} alt="Like Icon" className="like-icon" onClick={() => handleLike(plannerID)} />
                            <span className="like-number">{likeCount}</span>
                        </div >

                        {/* 작성일 */}
                        < h2 className="topcard-footer-createAt" > {moment(plannerItem.createAt).format('YYYY년 MM월 DD일')} 생성</h2 >
                    </div >

                </div >

                {/* 유저의 정보에 따라 표시할 내용 */}
                < div className="destination-user" >
                    <div className="destinaion-user-info">
                        <img className="topcard-userProfileImg" src={plannerItem.thumbnailImage} ></img>
                        <span className="destination-username">{username}님의 코스 정보</span>
                    </div>

                    {/* 로그인 돼 있는 유저의 pk와 planner의 유저가 일치 할 시 수정 삭제 버튼 */}
                    <div className="destination-plannerControl">
                        {loginStatus && loginStatus.userid && loginStatus.userid === plannerItem.userId ? (
                            <>
                                <button className="destination-plannerControl-button">수정</button>
                                <button className="destination-plannerControl-button">삭제</button>
                            </>

                        ) : (
                            <button className="destination-plannerControl-button" onClick={() => { handleAddToMyCourse() }}>내 코스로 담기</button>
                        )
                        }
                    </div>

                </div >

                {
                    destinations.length > 0 ? (
                        destinations.map((destination, index) => {
                            const isNewDay = index === 0 || destination.day !== destinations[index - 1].day;
                            const prevDestination = destinations[index - 1];
                            const distance = prevDestination ? calculateDistance(prevDestination.y, prevDestination.x, destination.y, destination.x) : 0;



                            return (
                                // 플래너의 코스 상세
                                <div key={index} className="destination-card">

                                    <ul className="destination-card-ul">
                                        {isNewDay && (
                                            <div>
                                                <p className="destination-day" style={{ color: `${dayColors[(destination.day - 1) % dayColors.length]}` }}>
                                                    Day {destination.day}

                                                </p>

                                            </div>
                                        )}
                                        {/* 경로 보기 버튼을 Day가 넘어갔을 때 제외하고 생성 */}
                                        {!isNewDay && (
                                            <div className="destination-distance">
                                                <span className="destination-distance-span">총 {distance.toFixed(2)} km</span>

                                                <button className="destination-distance-button" onClick={() => window.open(getDirections(prevDestination, destination), '_blank')}> <img className="icon" src={findwayIcon}></img></button>

                                            </div>
                                        )}

                                        <li className="destination-info">
                                            <p className="destination-dayOrder">{destination.dayOrder}</p>
                                            {!isNewDay && (
                                                <div className="line"></div>
                                            )}
                                            <span className="destination-image">
                                                <img src={destination.image} alt="destination" />
                                            </span>
                                            <div className="destination-desc">
                                                <p className="destination-category">{destination.category}</p>
                                                <p className="destination-title" onClick={() => desInfoClick(destination, index)}>{destination.name}</p>
                                                <p className="destination-address" onClick={() => addressClick(destination, index)}>{destination.address}</p>
                                            </div>
                                        </li>

                                    </ul>
                                </div>
                            );

                        })
                    ) : (
                        <p>등록된 여행지가 없습니다.</p>
                    )
                }
            </div >
            <div id="main-map" className="destination-map"></div>
        </>
    );
};

export default Destination;
