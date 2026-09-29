import * as Location from "expo-location";
import { useEffect, useState } from "react";

type Position = {
  latitude: number;
  longitude: number;
};

export default function Index() {
  const [position, setPosition] = useState<Position | null>(null);
  const [locationError, setLocationError] = useState<String | null>(null);
  const [angle, setAngle] = useState<number | null>(null);
  const [sensorMessage, setSensorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function getLocation() {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (!active) return;

        if (permission.status !== "granted") {
          setLocationError("Permissão de Localização Negada");
          return;
        }

        const result = await Location.getCurrentPositionAsync({});

        if (active) {
          setPosition({
            latitude: result.coords.latitude,
            longitude: result.coords.longitude,
          });
        }
      } catch {
        if (active) {
          setLocationError("Não foi possível obter a localização");
        }
      }
    }

    getLocation();
    return () => {
      active = false;
    };
  }, []);
}
