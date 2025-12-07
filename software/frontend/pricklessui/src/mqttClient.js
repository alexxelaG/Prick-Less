import mqtt from "mqtt";

const brokerUrl = "ws://10.251.52.134:9001"; // your Mac's IP

const options = {
  reconnectPeriod: 1000,
  clean: true,
};

const client = mqtt.connect(brokerUrl, options);

export default client;
