$  (document).ready(function () {

    const apiKey = '5333491724885a51ef33ac76ba504ffe';

    const cityEl = $('h2#city');
    const dateEl = $('h3#date');
    const weatherIconEl = $('img#weather-icon');
    const temperatureEl = $('span#temperature');
    const humidityEl = $('span#humidity');
    const windEl = $('span#wind');
    const uvIndexEl = $('span#uv-index');
    const cityListEl = $('div.cityList');

    const cityInput = $('#city-input');

    let pastCities = [];

    function compare(a, b) {
        const cityA = a.city.toUpperCase();
        const cityB = b.city.toUpperCase();

        let comparison = 0;
        if (cityA > cityB) {
            comparison = 1;
        } else if (cityA < cityB) {
            comparison = -1;
        }
        return comparison;
    }

    function loadCities() {
        const storedCites = JSON.parse(localStorage.getItem('pastCities'));
        if (storedCities) {
            pastCities = storedCities;
        }
    }

    function storedCities() {
        localStorage.setItem('pastCities', JSON.stringify(pastCities));
    }

    function buildURLFromInputs(city) {
        if (city) {
            return 'https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}';
        }
    }

    function buildURLFromId(id) {
        return 'https://api.openweathermap.org/data/2.5/weather?ide=${id}&appid=${apiKey}';
    }

    function displayCities(pastCities) {
        cityListEl.empty();
        pastCities.splice(5);
        let sortedCities = [...pastCities];
        sortedCities.sort(compare);
        sortedCities.forEach(function (location) {
            let cityDiv = $('<div>').addClass('col-12 city');
            let cityBtn = $('<button>').addClass('btn-light city-btn').text(location.city);
            cityDiv.append(cityBtn);
            cityListEl.append(cityDiv);
        });
    }

    function searchWeather(queryURL) {
        if (uvi < 3) {
            return 'green';
        } else if (uvi >= 3 && uvi < 6) {
            return 'yellow';
        } else if (uvi >= 6 && uvi < 8) {
            return 'orange';
        } else if (uvi >= 8 && uvi < 11) {
            return 'red';
        } else return 'purple';
    }

    $.ajax({
        url: queryURL,
        method: 'GET'
    }).then(function (response) {

        let city = response.name;
        let id = response.id;

        if (pastCities[0]) {
            pastCities = $.grep(pastCities, function (storedCity) {
                return id !== storedCity.id;
            })
        }
        pastCities.unshift({ city, id });
        storeCities();
        displayCities(pastCities);

        cityEl.text(response.name);
        let formattedDate = moment.unix(response.dt).format('L');
        dateEl.text(formattedDate);
        let weatherIcon = response.weather[0].icon;
        weatherIconEl.attr('src', 'http://openweathermap.org/img/wn/${weatherIcon}.png').attr('alt', response.weather[0].description);
        temperatureEl.html(((response.main.temp - 273.15) * 1.8 + 32).toFixed(1));
        humidityEl.text(response.main.humidity);
        windEl.text((response.wind.speed * 2.237).toFixed(1));

        let lat = response.coord.lat;
        let lon = response.coord.lon;
        let queryURLAll = 'https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}';
        $.ajax({
            url: queryURLAll,
            method: 'GET'
        }).then(function (response) {
            let uvIndex = response.current.uvi;
            let uvColor = setUVIndexColor(uvIndex);
            uvIndexEl.text(response.current.uvi);
            uvIndexEl.attr('style', 'background-color: ${uvColor}; color: ${uvColor === "yellow" ? "black" : "white"}');
            let fiveDay = response.daily;

            for (let i = 0; i <= 5; i++) {
                let currDay = fiveDay [i];
                $('div.day-${i} .card-title').text(moment.unix(currDay.dt).format('L'));
                $('div.day-${i} .fiveDay-img').attr(
                    'src',
                    'http://openweathermap.org/img/wn${currDay.weather[0].icon}.png'
                ).attr('alt', currDay.weather[0].description);
                $('div.day-${i} .fiveDay-temp').text(((currDAy.temp.day - 273.15) * 1.8 + 32).toFixed(1));
                $('div.day-${i} .fiveDay-humid').text(currDay.humidity);

            }
        });
    });
})


function displayLastSearchedCity() {
    if (pastCities[0]) {
        let queryURL = buildURLFromId(pastCities[0].id);
        searchWeather(queryURL);
    } else {
        let queryURL = buildURLFromInputs("Seattle");
        searchWeather(queryURL);
    }
}


$('#search-btn').on('click', function (event) {
    event.preventDefault();

    let city = cityInput.val().trim();
    city = city.replace(' ', '%20');

    cityInput.val('');

    if (city) {
        let queryURL = buildURLFromInputs(city);
        searchWeather(queryURL);
    }
});

$(document).on("click", "button.city-btn", function (event) {
    let clickedCity = $(this).text();
    let foundCity = $.grep(pastCities, function (storedCity) {
        return clickedCity === storedCity.city;
    })
    let queryURL = buildURLFromId(foundCity[0].id)
    searchWeather(queryURL);
});

loadCities();
displayCities(pastCities);

displayLastSearchedCity();

});