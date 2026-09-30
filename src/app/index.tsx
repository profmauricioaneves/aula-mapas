import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

type Position = {
  latitude: number;
  longitude: number;
};

export default function Index() {
  const [position, setPosition] = useState<Position | null>(null);
  const [locationError, setLocationError] = useState<String | null>(null);
  const [angle, setAngle] = useState<number | null>(null);
  const [sensorMessage, setSensorMessage] = useState("");

  //pede permissão e busca a localização do aparelho
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

  //le o magnetometro e mostra um ângulo aproximado
  useEffect(() => {
    let active = true;
    let subscription: ReturnType<typeof Magnetometer.addListener> | undefined;

    async function startMagnetometer() {
      try {
        const available = await Magnetometer.isAvailableAsync();

        if (!active) return;

        if (!available) {
          setSensorMessage("Magnetometro indisponível neste aparelho");
          return;
        }

        Magnetometer.setUpdateInterval(500);
        subscription = Magnetometer.addListener(({ x, y }) => {
          const degrees = (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
          setAngle(Math.round(degrees));
        });
      } catch {
        if (active) {
          setSensorMessage("Não foi possível acessar o Magnetômetro");
        }
      }
    }

    startMagnetometer();

    return () => {
      active = false;
      subscription?.remove();
    };
  }, []);

  if (locationError) {
    return (
      <View>
        <Text>{locationError}</Text>
      </View>
    );
  }

  if (!position) {
    return (
      <View>
        <ActivityIndicator size="large" />
        <Text>Buscando localização...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: position.latitude,
          longitude: position.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={position}
          title="Estou aqui"
          description="Minha localização atual"
        />
      </MapView>

      <View>
        <Text>Latitude: {position.latitude.toFixed(5)}</Text>
        <Text>Longitude: {position.longitude.toFixed(5)}</Text>
        <Text>
          Ângulo do magnetometro: {angle === null ? "lendo ..." : `${angle}º`}
        </Text>
        {sensorMessage ? <Text>{sensorMessage}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
