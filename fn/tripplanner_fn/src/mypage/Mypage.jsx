import React from "react";
import { Routes, Route } from "react-router-dom";
import Planners from "./Planners";
import MyInformation from "./MyInformation";

const Mypage = () => {
  return (
    <div>
        <MyInformation/>
        <Planners/>
    </div>
  );
};

export default Mypage;
