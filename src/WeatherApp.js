import React, { useEffect, useState, useCallback } from "react";
import styled from "@emotion/styled";

import { ReactComponent as CloudyIcon } from "./images/day-cloudy.svg";
import { ReactComponent as RainIcon } from "./images/rain.svg";
import { ReactComponent as AirFlowIcon } from "./images/airFlow.svg";
import { ReactComponent as RedoIcon } from "./images/refresh.svg";

const fetchCurrentWeather = () => {
  return fetch(
    "https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=" +
      process.env.REACT_APP_WEATHER_API_KEY +
      "&locationName=臺北"
  ) // 向 requestURL 發送請求
    .then((response) => response.json()) // 取得伺服器回傳的資料並以 JSON 解析
    .then((data) => {
      // console.log("data", data);
      const locationData = data.records.location[0];

      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (["WDSD", "TEMP", "HUMD", "Weather"].includes(item.elementName)) {
            neededElements[item.elementName] = item.elementValue;
          }
          return neededElements;
        },
        {}
      );

      return {
        observationTime: locationData.time.obsTime,
        locationName: locationData.locationName,
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
        humid: weatherElements.HUMD
      };
    }); // 取得解析後的 JSON 資料
};

const fetchWeatherForecast = () => {
  return fetch(
    "https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=" +
      process.env.REACT_APP_WEATHER_API_KEY +
      "&locationName=臺北市"
  ) // 向 requestURL 發送請求
    .then((response) => response.json()) // 取得伺服器回傳的資料並以 JSON 解析
    .then((data) => {
      // console.log("data", data);
      const locationData = data.records.location[0];

      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (["Wx", "PoP", "CI"].includes(item.elementName)) {
            neededElements[item.elementName] = item.time[0].parameter;
          }
          return neededElements;
        },
        {}
      );

      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName
      };
    }); // 取得解析後的 JSON 資料
};

const WeatherApp = () => {
  // Styled component
  const Container = styled.div`
    background-color: #ededed;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const WeatherCard = styled.div`
    position: relative;
    min-width: 360px;
    box-shadow: 0 1px 3px 0 #999999;
    background-color: #f9f9f9;
    box-sizing: border-box;
    padding: 30px 15px;
  `;

  const Location = styled.div`
    font-size: 28px;
    color: ${(props) => (props.theme === "dark" ? "#dadada" : "#212121")};
    margin-bottom: 20px;
  `;

  const Description = styled.div`
    font-size: 16px;
    color: #828282;
    margin-bottom: 30px;
  `;

  const CurrentWeather = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  `;

  const Temperature = styled.div`
    color: #757575;
    font-size: 96px;
    font-weight: 300;
    display: flex;
  `;

  const Celsius = styled.div`
    font-weight: normal;
    font-size: 42px;
  `;

  const AirFlow = styled.div`
    display: flex;
    align-items: center;
    font-size: 16x;
    font-weight: 300;
    color: #828282;
    margin-bottom: 20px;

    svg {
      width: 25px;
      height: auto;
      margin-right: 30px;
    }
  `;

  const Rain = styled.div`
    display: flex;
    align-items: center;
    font-size: 16x;
    font-weight: 300;
    color: #828282;

    svg {
      width: 25px;
      height: auto;
      margin-right: 30px;
    }
  `;

  const Cloudy = styled(CloudyIcon)`
    flex-basis: 30%;
  `;

  const Redo = styled.div`
    position: absolute;
    right: 15px;
    bottom: 15px;
    font-size: 12px;
    display: inline-flex;
    align-items: flex-end;
    color: #828282;
    background-color: #faebd5;

    svg {
      background-color: white;
      margin-left: 10px;
      width: 15px;
      height: 15px;
      cursor: pointer;
    }
  `;

  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    locationName: "",
    humid: 0,
    temperature: 0,
    windSpeed: 0,
    description: "",
    weatherCode: 0,
    rainPossibility: 0,
    comfortability: ""
  });

  const fetchData = useCallback(() => {
    const fetchingData = async () => {
      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather(),
        fetchWeatherForecast()
      ]);

      // console.log(currentWeather, weatherForecast);

      setWeatherElement({
        ...currentWeather,
        ...weatherForecast
      });
    };

    fetchingData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Container>
      <WeatherCard>
        <Location theme="dark">{weatherElement.locationName}</Location>
        <Description>
          {new Intl.DateTimeFormat("zh-TW", {
            hour: "numeric",
            minute: "numeric"
          }).format(new Date(weatherElement.observationTime))}{" "}
          {weatherElement.description}
        </Description>
        <CurrentWeather>
          <Temperature>
            {Math.round(weatherElement.temperature)}
            <Celsius>°C</Celsius>
          </Temperature>
          <Cloudy />
        </CurrentWeather>
        <AirFlow>
          <AirFlowIcon />
          {Math.round(weatherElement.humid * 100)} m/h
        </AirFlow>
        <Rain>
          <RainIcon />
          {weatherElement.windSpeed} %
        </Rain>
        <Redo onClick={fetchData}>
          最後觀測時間:{" "}
          {new Intl.DateTimeFormat("zh-TW", {
            hour: "numeric",
            minute: "numeric"
          }).format(new Date(weatherElement.observationTime))}
          <RedoIcon />
        </Redo>
      </WeatherCard>
    </Container>
  );
};

export default WeatherApp;
