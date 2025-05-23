import React, { useState, useEffect, useRef } from 'react';
import { Marker, Popup,useMapEvents } from 'react-leaflet';
import "proj4"
import "proj4leaflet"
import L, { marker } from 'leaflet';
import axios from 'axios';

import SideBar from '../PlannerList/PlannerList';

const Map = (props) => {
    const [isClicked, setIsClicked] = useState(false);
    // map을 상태로 설정
    const [map, setMap] = useState(null);
    const [center , setCenter] = useState({ lat: 35.1795543, lng: 129.0756416 })
    const [layerGroup, setLayerGroup] = useState(L.layerGroup());

    const isMounted = useRef(false);

    const handleClickMarker = () => {
        setIsClicked(!isClicked);
    };

    var accomIcon = L.icon({
        iconUrl:'',
        
    });

    var foodIcon = L.icon({
        iconUrl:'/images/food_icon.png',
        iconSize:[25,50],
    })

    // 지도에 마커 생성 (비동기요청)
    const MapRender = async (zoomlevel) => {
        // 비동기요청
        await axios.post('http://localhost:9000/planner/listDestination',
            {"latitude":center.lat, "longitude":center.lng,"zoomlevel":zoomlevel},
            {"Content-Type" : "application/json"},
        )
        .then(resp=>{
            // 모든 마커 삭제
            layerGroup.clearLayers();

            // 체크박스의 food값이 true일 경우에만
            if(props.OptionData[0].food) {
                // 음식리스트
                const foodList = JSON.parse(resp.data.foodList);
                foodList.forEach(el => {
                    const lat = el.xCoordinate; const lng = el.yCoordinate;
                    // 마커 생성 후 layerGroup에 추가
                    const marker = L.marker([lng,lat],{icon: foodIcon}).addTo(layerGroup);
                    // 마커 클릭시 팝업 생성
                    marker.on('click', () => {
                        marker.unbindPopup();
                        marker.bindPopup(
                            `
                            <style></style>
                            업장명 : ${el.businessName} <br/>
                            카테고리 : ${el.businessCategory} <br/>
                            주소 : ${el.streetFullAddress} <br/>
                            <button class='planner_btn ${el.businessName}' >플래너에 추가</button>
                            `
                        ).openPopup();
                    })
                    // 팝업 오픈시 팝업 내에 있는 버튼의 이벤트리스너 추가
                    marker.on('popupopen',function(e){
                        const nodeList = e.target._popup._contentNode.childNodes;
                        nodeList[9].addEventListener('click', async () => {
                            await  axios.post('http://localhost:9000/planner/findDestination',
                                {"businessName":el.businessName, "businessCategory":el.businessCategory,"streetFullAddress":el.streetFullAddress,"coordinate_x":el.xCoordinate,"coordinate_y":el.yCoordinate},
                                {"Content-Type":"application/json"},
                            )
                            .then(resp=>{
                                props.AddDestination({"day":props.DayData,"data":resp.data})
                            })
                            .catch(err=>{console.log(err)})
                        });
                    })

                });
            }

            // 체크박스의 accom값이 true일 경우에만
            if(props.OptionData[0].accom) {
                // 숙소리스트
                const accomList = JSON.parse(resp.data.accomList);
                accomList.forEach(el => {
                    const lat = el.xCoordinate; const lng = el.yCoordinate;
                    // 마커 생성 후 layerGroup에 추가
                    const marker = L.marker([lng,lat]).addTo(layerGroup);
                    // 마커 클릭시 팝업 생성
                    marker.on('click', () => {
                        marker.unbindPopup();
                        marker.bindPopup(
                            `
                            <style>backgroundColor:pink;</style>
                            업장명 : ${el.businessName} <br/>
                            카테고리 : ${el.businessCategory} <br/>
                            주소 : ${el.streetFullAddress} <br/>
                            <button class='planner_btn ${el.businessName}' >플래너에 추가</button>
                            `
                        ).openPopup();
                    })
                    // 팝업 오픈시 팝업 내에 있는 버튼의 이벤트리스너 추가
                    marker.on('popupopen',function(e){
                        const nodeList = e.target._popup._contentNode.childNodes;
                        nodeList[9].addEventListener('click', async () => {
                            await  axios.post('http://localhost:9000/planner/findDestination',
                                {"businessName":el.businessName, "businessCategory":el.businessCategory,"streetFullAddress":el.streetFullAddress,"coordinate_x":el.xCoordinate,"coordinate_y":el.yCoordinate},
                                {"Content-Type":"application/json"},
                            )
                            .then(resp=>{
                                props.AddDestination({"day":props.DayData,"data":resp.data})
                            })
                            .catch(err=>{console.log(err)})
                        });
                    })

                });
            }
            layerGroup.addTo(map);
        })
        .catch(err=>{console.log(err)});
    }

    useEffect(()=>{

        if(map && props.AreaData) {
            var lat = Number(props.AreaData[1])
            var lng = Number(props.AreaData[0])

            map.setView([lat,lng], 7);
        }
    },[props.AreaData])

    useEffect(()=>{
        if(isClicked) {
            if(props.ClickDestination) {
                const data = props.ClickDestination.data;
                handleClickMarker(data)

            }
        } else {
            isMounted(true);
        }

    },[props.ClickDestination])

    useEffect(()=>{
        if(isClicked) {
            if(props.ClickSearchDestination) {
                const data = props.ClickSearchDestination;
                handleClickMarker(data)
            }
        } else {
            isClicked(true);
        }
    },[props.ClickSearchDestination])



    // map 최초 로딩시
    useEffect(() => {
        // 좌표계 정의
        const EPSG5181 = new L.Proj.CRS(
            'EPSG:5181',
            // 'EPSG:4326',
            // '+proj=longlat +datum=WGS84 +no_defs',
            '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
            {
            resolutions: [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
            origin: [-30000, -60000],
            bounds: L.bounds([-30000-Math.pow(2,19)*4, -60000], [-30000+Math.pow(2,19)*5, -60000+Math.pow(2,19)*5])
            }          
        );
        
        // map 설정
        const mapInstance = L.map('map', {
            center: [center.lat, center.lng],
            crs: EPSG5181,
            zoom:9,
        });

        // map의 베이스
        const tileLayer =L.tileLayer('http://map{s}.daumcdn.net/map_2d/1807hsm/L{z}/{y}/{x}.png', {
            minZoom:9,
            maxZoom:13,
            zoomReverse:true,
            zoomOffset:1,
            subdomains:'0123',
            continuousWorld:true,
            tms:true,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);

        // Map 객체를 상태로 저장
        setMap(mapInstance);

        // 지도 이동 시 이벤트
        mapInstance.on('moveend', async () => {
            const center = mapInstance.getCenter();
            setCenter({ lat: center.lat, lng: center.lng });
        });

        return () => {
            mapInstance.remove(); // 컴포넌트 언마운트 시 지도 제거
        };
    }, []);

    // center가 변할 때마다 지도 이동
    useEffect(() => {
        if (map && center) {
            MapRender(map.getZoom());
        }
    },[center])


    // 체크박스가 변경될 때 마다 Map Rendering
    useEffect(()=>{
        if (map && props.OptionData) {
            MapRender(map.getZoom());
        }
    },[props.OptionData])

    // 지역이 변경될 때 마다 Map Rendering
    useEffect(()=>{
        if(map && props.AreaData) {
            var lat = Number(props.AreaData[1])
            var lng = Number(props.AreaData[0])

            map.setView([lat,lng], 7);
        }
    },[props.AreaData])

    return (
        <>              
            <div id="map" style={{width: '70vw',height:'90vh'}} ></div>
            {/* style={{ width: '60vw', height: '80vh',position:"absolute",left:"400px" }} */}
        </>
    );
}

export default Map;
