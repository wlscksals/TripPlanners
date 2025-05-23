import {useState, useEffect} from 'react';

const Options = (props) => {
    // 각 체크박스의 checked상태 정의
    const [food, setFood] = useState(true);
    const [accom, setAccom] = useState(true);
    const [place, setPlace] = useState(true);

    // 체크박스 전체를 check상태로 설정
    const viewAll = () => {
        setFood(true);
        setAccom(true);
        setPlace(true);
    }
    // 각각의 체크박스를 눌렀을 때 checked의 상태 설정
    const viewFood = () => {setFood(!food)}
    const viewAccom = () => {setAccom(!accom)}
    const viewPlace = () => {setPlace(!place)}

    // 체크박스의 상태가 변할 때 마다 부모로 데이터를 업데이트 한다.
    useEffect(()=>{
        props.OptionData([{"food":food,"accom":accom,"place":place}])
    },[food,accom,place])

    return (
        <>
            <input
                type="button"
                name="all"
                id="all"
                onClick={viewAll}
                value="전체"
            />
            
            <label>식당</label>
            <input
                type="checkbox"
                name="food"
                id="food"
                onChange={viewFood}
                checked={food}
            />

            <label>숙소</label>
            <input
                type="checkbox"
                name="accom"
                id="accom"
                onChange={viewAccom}
                checked={accom}
            />

            <label>관광지</label>
            <input
                type="checkbox"
                name="place"
                id="place"
                checked={place}
                onChange={viewPlace}
            />
        </>
    );
}

export default Options;