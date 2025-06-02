const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.isConfigured = !!this.apiKey;
    
    if (!this.isConfigured) {
      console.log('🌤️ Weather service not configured - API key missing');
    } else {
      console.log('🌤️ Weather service initialized');
    }
  }

  // Get current weather by city name
  async getCurrentWeatherByCity(city) {
    if (!this.isConfigured) {
      return { success: false, error: 'Weather API not configured' };
    }

    try {
      const url = `${this.baseUrl}/weather`;
      const params = {
        q: city,
        appid: this.apiKey,
        units: 'metric',
        lang: 'id'
      };

      const response = await axios.get(url, { params });
      
      return {
        success: true,
        data: this.formatWeatherData(response.data)
      };

    } catch (error) {
      console.error('Weather API error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  // Get current weather by coordinates
  async getCurrentWeatherByCoords(lat, lon) {
    if (!this.isConfigured) {
      return { success: false, error: 'Weather API not configured' };
    }

    try {
      const url = `${this.baseUrl}/weather`;
      const params = {
        lat: lat,
        lon: lon,
        appid: this.apiKey,
        units: 'metric',
        lang: 'id'
      };

      const response = await axios.get(url, { params });
      
      return {
        success: true,
        data: this.formatWeatherData(response.data)
      };

    } catch (error) {
      console.error('Weather API error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  // Get weather forecast (5 days)
  async getWeatherForecast(lat, lon) {
    if (!this.isConfigured) {
      return { success: false, error: 'Weather API not configured' };
    }

    try {
      const url = `${this.baseUrl}/forecast`;
      const params = {
        lat: lat,
        lon: lon,
        appid: this.apiKey,
        units: 'metric',
        lang: 'id'
      };

      const response = await axios.get(url, { params });
      
      return {
        success: true,
        data: {
          city: response.data.city,
          forecast: response.data.list.map(item => this.formatWeatherData(item))
        }
      };

    } catch (error) {
      console.error('Weather forecast API error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  // Format weather data for consistent response
  formatWeatherData(data) {
    return {
      datetime: data.dt_txt || new Date(data.dt * 1000).toISOString(),
      temperature: {
        current: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        min: Math.round(data.main.temp_min),
        max: Math.round(data.main.temp_max)
      },
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      weather: {
        main: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        icon_url: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
      },
      wind: {
        speed: data.wind?.speed || 0,
        direction: data.wind?.deg || 0
      },
      clouds: data.clouds?.all || 0,
      visibility: data.visibility ? Math.round(data.visibility / 1000) : null, // Convert to km
      rain: data.rain ? {
        '1h': data.rain['1h'] || 0,
        '3h': data.rain['3h'] || 0
      } : null,
      snow: data.snow ? {
        '1h': data.snow['1h'] || 0,
        '3h': data.snow['3h'] || 0
      } : null,
      uv_index: data.uvi || null,
      sunrise: data.sys?.sunrise ? new Date(data.sys.sunrise * 1000).toISOString() : null,
      sunset: data.sys?.sunset ? new Date(data.sys.sunset * 1000).toISOString() : null
    };
  }

  // Get weather recommendation for futsal
  getWeatherRecommendation(weatherData) {
    const temp = weatherData.temperature.current;
    const humidity = weatherData.humidity;
    const weather = weatherData.weather.main.toLowerCase();
    const rain = weatherData.rain;
    
    let recommendation = {
      suitable: true,
      level: 'good', // excellent, good, fair, poor
      message: 'Cuaca bagus untuk bermain futsal',
      tips: []
    };

    // Temperature check
    if (temp < 20) {
      recommendation.level = 'fair';
      recommendation.message = 'Cuaca agak dingin untuk bermain futsal';
      recommendation.tips.push('Lakukan pemanasan lebih lama');
    } else if (temp > 35) {
      recommendation.level = 'poor';
      recommendation.message = 'Cuaca terlalu panas untuk bermain futsal';
      recommendation.tips.push('Banyak minum air putih', 'Istirahat lebih sering');
    } else if (temp >= 25 && temp <= 30) {
      recommendation.level = 'excellent';
      recommendation.message = 'Cuaca sangat ideal untuk bermain futsal';
    }

    // Humidity check
    if (humidity > 80) {
      if (recommendation.level === 'excellent') recommendation.level = 'good';
      if (recommendation.level === 'good') recommendation.level = 'fair';
      recommendation.tips.push('Udara cukup lembab, siapkan handuk');
    }

    // Weather condition check
    if (weather.includes('rain') || weather.includes('storm')) {
      recommendation.suitable = false;
      recommendation.level = 'poor';
      recommendation.message = 'Cuaca hujan, tidak disarankan bermain futsal outdoor';
      recommendation.tips = ['Pilih lapangan indoor', 'Tunggu hingga hujan reda'];
    } else if (weather.includes('cloud')) {
      if (recommendation.level === 'excellent') recommendation.level = 'good';
      recommendation.tips.push('Cuaca berawan, cocok untuk bermain');
    }

    // Rain check
    if (rain && (rain['1h'] > 0 || rain['3h'] > 0)) {
      recommendation.suitable = false;
      recommendation.level = 'poor';
      recommendation.message = 'Sedang atau akan hujan';
      recommendation.tips = ['Pilih lapangan indoor', 'Tunda booking outdoor'];
    }

    return recommendation;
  }

  // Get weather for multiple field locations
  async getWeatherForFields(fields) {
    if (!this.isConfigured) {
      return { success: false, error: 'Weather API not configured' };
    }

    try {
      const weatherPromises = fields.map(async (field) => {
        if (!field.coordinates || !field.coordinates.lat || !field.coordinates.lng) {
          return {
            field_id: field.id,
            field_name: field.name,
            weather: null,
            error: 'Koordinat lapangan tidak tersedia'
          };
        }

        const weatherResult = await this.getCurrentWeatherByCoords(
          field.coordinates.lat, 
          field.coordinates.lng
        );

        return {
          field_id: field.id,
          field_name: field.name,
          weather: weatherResult.success ? weatherResult.data : null,
          recommendation: weatherResult.success ? 
            this.getWeatherRecommendation(weatherResult.data) : null,
          error: weatherResult.success ? null : weatherResult.error
        };
      });

      const results = await Promise.all(weatherPromises);

      return {
        success: true,
        data: results
      };

    } catch (error) {
      console.error('Weather for fields error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new WeatherService();
