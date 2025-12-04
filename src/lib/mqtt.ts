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

    // 2. MQTT connection setup
    const options: mqtt.IClientOptions = {
      protocol: import.meta.env.VITE_MQTT_PROTOCOL || "ws",
      host: import.meta.env.VITE_MQTT_HOST || "localhost",
      port: import.meta.env.VITE_MQTT_PORT || "8080",
      path: "/mqtt",
      clientId: "web_client_" + Math.random().toString(16).substr(2, 8),
      rejectUnauthorized: false, // For self-signed certificates
      ca: [], // Add your CA certificate if needed
      username: import.meta.env.VITE_MQTT_USERNAME || "digital",
      password: import.meta.env.VITE_MQTT_PASSWORD || "masterkey",
      reconnectPeriod: import.meta.env.VITE_MQTT_RECONNECT_PERIOD || 1000,
    };

    const client = mqtt.connect(options);
    console.log(client.options);
    clientRef.current = client;

    // 3. MQTT event listeners
    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      setIsConnected(true);
      const topic = (import.meta.env.VITE_MQTT_TOPIC || "calcdata") + "/#";
      console.log("Subscribing to topic:", topic);
      client.subscribe(topic, (err) => {
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
      setTanks(() => {
        const extended = tankData.map((item) => {
          const maxLevel = item.max_graduration_level ?? 0;
          const maxVolume = item.max_graduration_volume ?? 0;
          const productLevel = item.product_level ?? 0;
          const productSpeed = item.product_speed ?? 0;
          const observedDensity = item.observed_density ?? 0;
          const maxAllowed = item.max_allowed_level;
          const minAllowed = item.min_allowed_level;

          return {
            ...item,
            level_percent:
              productLevel && maxLevel !== 0
                ? (productLevel / maxLevel) * 100
                : 0,
            volume_percent:
              item.total_observed_volume && maxVolume && maxVolume !== 0
                ? (item.total_observed_volume / maxVolume) * 100
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
                  ? `${Math.floor((maxAllowed - productLevel) / productSpeed / 60).toFixed(0)}г:${((Math.floor(maxAllowed - productLevel) / productSpeed) % 60).toFixed(0)}хв`
                  : `${Math.floor((productLevel - minAllowed) / Math.abs(productSpeed) / 60).toFixed(0)}г:${((Math.floor(productLevel - minAllowed) / Math.abs(productSpeed)) % 60).toFixed(0)}хв`
                : "-",
            is_error:
              item?.product_level > item?.max_allowed_level ||
              item?.product_level < item?.min_allowed_level ||
              (item?.sediment_level > 0 &&
                item?.sediment_level > item?.max_allowed_level),

            is_warning:
              item?.mass_threshold && item?.saved_mass
                ? Math.abs(
                    Number(item?.saved_mass ?? 0) -
                      Number(item?.product_mass ?? 0),
                  ) > Number(item?.mass_threshold ?? 0)
                : false || (item?.volume_threshold && item?.saved_volume)
                  ? Math.abs(
                      Number(item?.saved_volume ?? 0) -
                        Number(item?.total_observed_volume ?? 0),
                    ) > Number(item?.volume_threshold ?? 0)
                  : false,
          };
        });
        return Array.isArray(extended) && extended.length > 0 ? extended : [];
      });
    });

    client.on("error", (error) => {
      console.error("MQTT error:", error);
    });
  } catch (error) {
    console.warn("Initialization error:", error);
  }
}
