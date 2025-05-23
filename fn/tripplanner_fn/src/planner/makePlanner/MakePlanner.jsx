import {useState, useEffect} from 'react';
// import '../../public/reset.css'
import {useNavigate} from 'react-router-dom';
import Map from '../Map/Map';
import SideBar from '../SideBar/SideBar';
import './MakePlanner.scss'
import Option from '../Option/Options';
import axios from 'axios';

const MakePlanner = () => {
    const navigate = useNavigate();
    const [cookie,setCookie] = useState();
    useEffect(() => {
        axios.post('http://localhost:9000/api/cookie/validate', {}, {
            withCredentials: true, // 쿠키 포함
        })
        .then(response => {
            console.log("쿠키 보내기:", response.data);
            setCookie(response.data);
        })
        .catch(error => {
            alert('로그인 후 이용가능한 서비스입니다.');
            navigate('/user/login');
        });
      }, [navigate]);  // 의존성 배열에 navigate 추가


    const [optionState, setOptionState] = useState(null);
    const [areaState, setAreaState] = useState([]);
    const [plannerData, setPlannerData] = useState([]);
    const [selectedDay, setSelectedDay] = useState(1);

    const handleOption = (data) => { setOptionState(data); }

    const handleArea = (data) => {setAreaState(data)}

    const handleData = async (data) => {
        await axios.post('http://localhost:9000/planner/getImages',
            {'businessName':data.data.businessName},
        )
        .then(resp=>{
            console.log(resp)
            const updatedData = {
                ...data,  // 기존 data 객체를 복사
                image: resp.data.image  // image 키 추가
            };
    
            // plannerData에 updatedData 추가
            setPlannerData((plannerData) => [...plannerData, updatedData]);
        })
        .catch(err=>{console.log(err)});
    }

    const handleDay = (data) => { setSelectedDay(data); }

    const handleDeleteDest = (day, index) => {
        setPlannerData(prevPlannerData =>
            prevPlannerData
                .filter(el => el.day !== day) // 해당 day와 일치하지 않는 항목만 남기기
                .concat(
                    prevPlannerData
                        .filter(el => el.day === day) // 해당 day와 일치하는 항목만 남기기
                        .filter((e, i) => i !== index) // 그 중 index에 해당하는 항목을 제외
                )
        );
    };


    const handleAllDelete = () => {
        setPlannerData([]);
    }


    return (
        <div className='planner' >
            <div className='plannerSide' >
                <SideBar
                    AreaCoordinate={handleArea}
                    DayState={handleDay}
                    DestinationData={plannerData}
                    DeleteDestination={handleDeleteDest}
                    DeleteAllDestination={handleAllDelete}
                    AddDestination={handleData}
                    CookieData={cookie}


                />
            </div>
            <div className='plannerBody' >
                {/* <Option OptionData={handleOption}/>
                <Map 
                    OptionData={optionState}
                    AreaData={areaState}
                    DayData={selectedDay}
                    AddDestination={handleData}

                /> */}

            </div>

        </div>
    )
}

export default MakePlanner;