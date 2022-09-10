import './App.css';
import SearchBar from './components/SearchBar';
import CloudIcon from '@mui/icons-material/Cloud';
import { useEffect, useState } from 'react';
import cloneDeep from 'lodash.clonedeep';
import Loader from './components/Loader';

const BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast/daily';
const PARAMS = {
  appid: '58b6f7c78582bffab3936dac99c31b25',
  units: 'metric'
}

function App() {
  const days = ['sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


  const [futureData, setFutureData] = useState({});
  const [todaysData, setTodaysData] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle search
  const handleSearch = () => {
    if (searchValue !== '') {
      const type = `q=${searchValue}`;
      fetchAPI(type);
    }
  }

  // Get date in string
  const getDateInString = (unformated_date) => {
    const date = new Date(unformated_date * 1000);
    const day = date.getDay();
    const month = date.getMonth();
    const year = date.getFullYear();
    const today = date.getDate();
    return `${days[day]} ${today} ${months[month]} ${year}`;
  }

  // Get sunrise and sunset time in string
  const getSunriseAndSunsetInString = (unformated_date) => {
    const sunrise_time = new Date(unformated_date * 1000);
    let sunrise_hour = sunrise_time.getHours();
    let sunrise_minutes = sunrise_time.getMinutes();
    let sunrise_hour_12 = sunrise_hour >= 13 ? sunrise_hour % 12 : sunrise_hour;
    let sunrise_am_pm = sunrise_hour > 12 ? 'PM' : 'AM';
    return `${sunrise_hour_12}:${sunrise_minutes} ${sunrise_am_pm}`
  }

  // Get day
  const getDay = (unformated_date) => {
    const date = new Date(unformated_date * 1000);
    const day = date.getDay();
    return days[day];
  }

  // Set weather data
  const setWeatherData = (data) => {
    const futureData = {
      country: data.city.country,
      name: data.city.name,
      day_two: { date: getDay(data.list[1].dt), temp: data.list[1].temp.day },
      day_three: { date: getDay(data.list[2].dt), temp: data.list[2].temp.day },
      day_four: { date: getDay(data.list[3].dt), temp: data.list[3].temp.day },
      day_five: { date: getDay(data.list[4].dt), temp: data.list[4].temp.day },
      day_six: { date: getDay(data.list[5].dt), temp: data.list[5].temp.day },
    };

    setFutureData({...futureData});

    const todaysData = {
      date: getDateInString(data.list[0].dt),
      temp: data.list[0].temp.day,
      feels_like: data.list[0].feels_like.eve,
      wind_speed: data.list[0].speed,
      humidity: data.list[0].humidity,
      pressure: data.list[0].pressure,
      sunrise: getSunriseAndSunsetInString(data.list[0].sunrise),
      sunset: getSunriseAndSunsetInString(data.list[0].sunset),
      night_temp: data.list[0].temp.night,
      desc: data.list[0].weather[0].description,
    };
    setTodaysData({ ...todaysData });
    setLoading(false);
  }

  // Fetch API
  const fetchAPI = async (type) => {
    setLoading(true);
    const FETCH_URL = `${BASE_URL}?${type}&cnt=10&units=${PARAMS.units}&appid=${PARAMS.appid}`;
    const response = await fetch(FETCH_URL);
    if (!response.ok) {
      throw new Error("Fetching error! Error Code: " + response.status);
    }
    const data = await response.json();
    setWeatherData(data);
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { coords: { latitude, longitude } } = position;
      const type = `lat=${latitude}&lon=${longitude}`;
      fetchAPI(type);
    });
  }, []);

  return (
    <div>
      <SearchBar searchValue={searchValue} setSearchValue={setSearchValue} handleSearch={handleSearch} />
      <div className='container'>
        {
          !loading ? (<div className='wrapper'>
            <div className='leftContainer'>
              <div className='todayContainer'>
                <div className='iconContainer' id='icon'><CloudIcon style={{ fontSize: 28 }} /></div>
                <div className='todayTextContainer'>
                  <div className='todayText'>Today</div>
                  <div className='todayDate' id='date'>{todaysData.date}</div>
                </div>
              </div>
              <div className='temperatureContainer'>
                <div className='tempandDegTextWrapper'>
                  <div className='temperature' id='temper'>{Math.floor(todaysData.temp)}</div>
                  <div className='degreeText'>°C</div>
                </div>
                <div className='locationandMoodContainer'>
                  <div className='locationWrapper'>
                    <div className='locationText' id='location'>{futureData.name}, {futureData.country}</div>
                  </div>
                  <div className='moodWrapper'>
                    <div className='mood' id='weather'>{todaysData.desc}</div>
                    <div className='dot'>•</div>
                    <div className='feels' id='feels-like'>Feels like {todaysData.feels_like}</div>
                  </div>
                </div>
              </div>
              <div className='parameterContainerOne'>
                <div className='speedWrapper'>
                  <div className='speedIcon'><img src="https://img.icons8.com/ultraviolet/40/000000/wind--v1.png" /></div>
                  <div className='speedText' id='speed'>{todaysData.wind_speed} km/h</div>
                </div>
                <div className='humidityWrapper'>
                  <div className='humidityIcon'><img src="https://img.icons8.com/ultraviolet/40/000000/hygrometer.png" /></div>
                  <div className='humidityText' id='humidity'>{todaysData.humidity}%</div>
                </div>
                <div className='pressureWrapper'>
                  <div className='pressureIcon'><img src="https://img.icons8.com/ultraviolet/40/000000/atmospheric-pressure.png" /></div>
                  <div className='pressureText' id='pressure'>{Math.floor(todaysData.pressure / 10)} pa</div>
                </div>
              </div>
              <div className='parameterContainerTwo'>
                <div className='sunRiseWrapper'>
                  <div className='sunRiseIcon'><img src="https://img.icons8.com/ultraviolet/40/000000/sunrise--v1.png" /></div>
                  <div className='sunRiseText' id='sunrise'>{todaysData.sunrise}</div>
                </div>
                <div className='sunSetWrapper'>
                  <div className='sunSetIcon'><img src="https://img.icons8.com/ultraviolet/40/000000/sunset--v1.png" /></div>
                  <div className='sunSetText' id='sunset'>{todaysData.sunset}</div>
                </div>
                <div className='nightWrapper'>
                  <div className='nightIcon'><img src="https://img.icons8.com/ultraviolet/40/000000/partly-cloudy-night--v1.png" /></div>
                  <div className='nightText' id='min-temp'>{todaysData.night_temp}°C</div>
                </div>
              </div>
              <div className='nextFiveDayContainer'>
                <div className='nextFiveDayTextWrapper'>
                  <div className='nextFiveDayText'>Five Day Forecast</div>
                </div>
              {
                (futureData.country) && (
                  <div className='daysContainer'>
                  <div className='daysWrapper'>
                    <div className='dayOneWrapper'>
                      <div className='dayOneText' id='day-two'>{futureData.day_two.date}</div>
                      <div className='dash' />
                      <div className='dayOneTemp' id='day-two-temp'>{futureData.day_two.temp}°C</div>
                    </div>
                    <div className='dayTwoWrapper'>
                      <div className='dayTwoText' id='day-three'>{futureData.day_three.date}</div>
                      <div className='dash' />
                      <div className='dayTwoTemp' id='day-three-temp'>{futureData.day_three.temp}°C</div>
                    </div>
                    <div className='dayThreeWrapper'>
                      <div className='dayThreeText' id='day-four'>{futureData.day_four.date}</div>
                      <div className='dash' />
                      <div className='dayThreeTemp' id='day-four-temp'>{futureData.day_four.temp}°C</div>
                    </div>
                    <div className='dayFourWrapper'>
                      <div className='dayFourText' id='day-five'>{futureData.day_five.date}</div>
                      <div className='dash' />
                      <div className='dayFourTemp' id='day-five-temp'>{futureData.day_five.temp}°C</div>
                    </div>
                    <div className='dayFiveWrapper'>
                      <div className='dayFiveText' id='day-six'>{futureData.day_six.date}</div>
                      <div className='dash' />
                      <div className='dayFiveTemp' id='day-six-temp'>{futureData.day_six.temp}°C</div>
                    </div>
                  </div>
                </div>
                ) 
              }
              </div>
            </div>
          </div>) : (<Loader />)
        }
      </div>
    </div>
  );
}

export default App;
