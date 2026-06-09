import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface WeatherData {
  cod: number | string;
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
  }>;
  wind: {
    speed: number;
  };
  sys: {
    sunrise: number;
    sunset: number;
  };
  timezone: number;
}

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY || " ";
const API_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "https://api.openweathermap.org/data/2.5";

export default function Index() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fetchWeather = async () => {
    if (!city) return;
    Keyboard.dismiss();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`,
      );
      const data = (await response.json()) as WeatherData;
      if (data.cod !== 200) {
        setError("City not found. Please try again.");
        setWeatherData(null);
      } else {
        setWeatherData(data);
      }
    } catch (err) {
      setError("An error occurred while fetching weather data.");
    }
    setLoading(false);
  };

  const getWeatherByLocation = async () => {
    setLoading(true);
    setError("");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access location was denied.");
        setLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const response = await fetch(
        `${API_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`,
      );
      const data = (await response.json()) as WeatherData;
      setWeatherData(data);
      setCity(data.name);
    } catch (err) {
      setError("An error occurred while fetching weather data.");
    }
    setLoading(false);
  };

  const formatTime = (unixTime: number, timezone: number): string => {
    const localTimestampMs = (unixTime + timezone) * 1000;
    const date = new Date(localTimestampMs);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather App</Text>
      <TextInput
        placeholder="Enter city name"
        value={city}
        onChangeText={setCity}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={fetchWeather}>
        <Text style={styles.buttonText}>Get Weather</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.locationButton]}
        onPress={getWeatherByLocation}
      >
        <Text style={styles.buttonText}>Use Current Location</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#333" />}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {weatherData && (
        <View style={styles.card}>
          <Text style={styles.city}>{weatherData.name}</Text>
          <Text style={styles.temp}>{Math.round(weatherData.main.temp)}°C</Text>
          <Text style={styles.condition}>{weatherData.weather[0].main}</Text>
          <View style={styles.row}>
            <Text>Humidity: {weatherData.main.humidity}%</Text>
            <Text>Wind: {weatherData.wind.speed} m/s</Text>
          </View>
          <View style={styles.row}>
            <Text>
              Sunrise{" "}
              {formatTime(weatherData.sys.sunrise, weatherData.timezone)}
            </Text>
            <Text>
              Sunset {formatTime(weatherData.sys.sunset, weatherData.timezone)}
            </Text>
          </View>
        </View>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "85%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    width: "85%",
    backgroundColor: "#333",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  locationButton: {
    backgroundColor: "#555",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    marginTop: 20,
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  city: {
    fontSize: 22,
    fontWeight: "bold",
  },
  temp: {
    fontSize: 48,
    fontWeight: "bold",
    marginVertical: 10,
  },
  condition: {
    fontSize: 18,
    color: "#555",
  },
  row: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  error: {
    color: "red",
    marginTop: 10,
  },
});
