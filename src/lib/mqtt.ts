import mqtt from "mqtt";

import type { TankMeasurement } from "@/components/tank.types";
/**
 * Initializes tanks data (via API fetch) and sets up MQTT listeners.
 * No cleanup logic; connection stays open.
 */
export async function initializeTanksAndMqtt(
  setTanks: React.Dispatch<React.SetStateAction<TankMeasurement[] | undefined>>,
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>,
  clientRef: React.MutableRefObject<mqtt.MqttClient | null>,
) {
  try {
    if (clientRef.current && !clientRef.current.disconnected) {
      setIsConnected(clientRef.current.connected);
      return;
    }
    const baseUrl = import.meta.env.PUBLIC_API_URL || "http://127.0.0.1:5000";
    // 1. Fetch tank data
    const res = await fetch(baseUrl + "/api/tanksExtended");
    if (!res.ok) console.warn("Failed to fetch tank data");

    const mapped: TankMeasurement[] = await res.json();

    if (Array.isArray(mapped) && mapped.length > 0) {
      setTanks(mapped);
    }

    // 2. MQTT connection setup
    const options: mqtt.IClientOptions = {
      username: import.meta.env.PUBLIC_MQTT_USERNAME || "digital",
      password: import.meta.env.PUBLIC_MQTT_PASSWORD || "masterkey",
      reconnectPeriod: import.meta.env.PUBLIC_MQTT_RECONNECT_PERIOD || 1000,
    };
    const connectionString =
      import.meta.env.PUBLIC_MQTT_BROKER || "ws://localhost:8080/mqtt";

    const client = mqtt.connect(connectionString, options);
    clientRef.current = client;

    // 3. MQTT event listeners
    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      setIsConnected(true);

      client.subscribe("calcdata/#", (err) => {
        if (err) {
          console.error("Subscription error:", err);
        } else {
          console.log("Subscribed to calcdata topic");
        }
      });
    });

    client.on("message", (topic, message) => {
      const tankData = JSON.parse(message.toString());
      console.log("Message received:", topic);
      setTanks((prev) => {
        if (!prev) return prev;

        const map = new Map(
          tankData.map((item: any) => [item.tank_id ?? item.value, item]),
        );

        const extended = prev.map((item) => {
          const incoming = (map.get(item.value ?? item.id) ??
            {}) as Partial<TankMeasurement>;
          const merged: TankMeasurement = { ...item, ...incoming };

          const maxLevel = merged.max_graduration_level ?? 0;
          const maxVolume = merged.max_graduration_volume ?? 0;
          const productLevel = merged.product_level ?? 0;
          const productSpeed = merged.product_speed ?? 0;
          const observedDensity = merged.observed_density ?? 0;
          const maxAllowed = merged.max_allowed_level;
          const minAllowed = merged.min_allowed_level;

          return {
            ...merged,
            level_percent:
              productLevel && maxLevel !== 0
                ? (productLevel / maxLevel) * 100
                : 0,
            volume_percent:
              merged.total_observed_volume && maxVolume && maxVolume !== 0
                ? (merged.total_observed_volume / maxVolume) * 100
                : 0,
            product_speed_volume:
              productSpeed && maxVolume && maxLevel && maxLevel !== 0
                ? (productSpeed * maxVolume) / maxLevel
                : 0,
            product_speed_mass:
              productSpeed &&
              maxVolume &&
              observedDensity &&
              maxLevel &&
              maxLevel !== 0
                ? ((productSpeed * maxVolume) / maxLevel) * observedDensity
                : 0,
            time_left:
              productLevel &&
              productSpeed &&
              maxAllowed !== undefined &&
              maxAllowed !== null &&
              minAllowed !== undefined &&
              minAllowed !== null &&
              productSpeed !== 0
                ? productSpeed > 0
                  ? `${Math.floor((maxAllowed - productLevel) / productSpeed / 60).toFixed(0)}г:${(Math.floor(maxAllowed - productLevel) / productSpeed) % 60}хв`
                  : `${Math.floor((productLevel - minAllowed) / Math.abs(productSpeed) / 60).toFixed(0)}г:${(Math.floor(productLevel - minAllowed) / Math.abs(productSpeed)) % 60}хв`
                : "-",
          };
        });
        return Array.isArray(extended) && extended.length > 0 ? extended : prev;
      });
    });

    client.on("error", (error) => {
      console.error("MQTT error:", error);
    });
  } catch (error) {
    console.warn("Initialization error:", error);
  }
}
