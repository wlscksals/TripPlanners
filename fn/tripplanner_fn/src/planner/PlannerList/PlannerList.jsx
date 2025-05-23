import { useState, useEffect } from 'react';
import axios from 'axios';

const PlannerList = ({MapData, Config}) => {
    // 여러 목적지를 저장할 destinations 배열
    const [destinations, setDestinations] = useState([]);

    // destination을 제거
    const deleteDestination = (key) => {
        setDestinations(
            destinations.filter((destination,index)=>{
                return index !== key;
            })
        )
    }

    // 현재 경로들을 DB에 저장
    const addPlanner = () => {
        console.log(destinations)
        if(destinations.length!=0) {
            axios.post('http://localhost:9000/planner/addPlanner',
                {"destinations":destinations},
                {"Content-Type" : "application/json"},
            )
            .then(resp=>console.log(resp))
            .catch(err=>console.log(err));
        } else {
            alert("경로를 선택해주세요.")
        }
    }

    const addDay = () => {
        var array = [];
        if(Config.day > 1) {
            for(var i=0; i<Config.day; i++) {
                array.push(<div>{i}일차</div>);
            }
        }

        return array;
    }

    // MapData가 SideBar로 전달될 때 마다 destinations배열에 MapData를 추가한다.
    useEffect(()=>{
        if(MapData) {
            setDestinations([...destinations,MapData]);
        }
    }, [MapData])

    return (
        <div className='side'>
            SideBar <br />
            <div className='side_header'>

            </div>
            <div className='side_body'>

                <div className='side_left'>
                    {addDay}
                </div>

                <div className='side_right'>
            
                    <ul>
                        { 
                            destinations.map((destination,index)=>{
                                return (
                                    <li key={index} className='side_card'>
                                        <div className='card_name'>{destination && destination.businessName}</div>
                                        <div className='card_category'>{destination && destination.businessCategory}</div>
                                        <div className='card_addr'>{destination && destination.streetFullAddress}</div>
                                        <div className='card_desc'>{destination && destination.description}</div>
                                        <button onClick={()=>deleteDestination(index)} >제거</button>
                                    </li>
                                );
                            })
                        }
                    </ul>

                    <button onClick={addPlanner} >플래너 생성</button>
                </div>
            </div>
        </div>
    );
};

export default PlannerList;
