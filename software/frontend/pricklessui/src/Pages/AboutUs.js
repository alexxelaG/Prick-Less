import React from 'react';
import './AboutUs.css';

function AboutUs() {
  return (
    <div className="about-us">
      <h1>About Us</h1>
      <div className="about-us-box">
        <p>
          Prick-Less is a simplified, non-invasive glucose monitoring system designed to offer an easy and accessible way to collect and visualize PPG sensor data. The system uses photoplethysmography (PPG)—a light-based technique—to collect sensor readings from fingertip sensors.
        </p>
        <p>
          The device is built around an ESP32 microcontroller, integrated with an infrared LED, photodiode sensor, and amplifier, which collects and transmits PPG signals wirelessly using the MQTT protocol.
        </p>
        <p>
          Data is sent to a cloud-based backend powered by AWS IoT Core and Firebase, where it is processed, stored, and analyzed. A trained machine learning model (e.g., Random Forest or SVM) filters noise, detects anomalies, and predicts glucose trends in real time. The system provides users with an interactive web dashboard and mobile app, developed using React.js and iOS, where they can view live readings, historical trends, and receive personalized health insights.
        </p>
        <p>
          By combining IoT, cloud computing, and AI, Prickless offers a scalable, user-friendly, and cost-effective solution for glucose monitoring—especially valuable for individuals with diabetes or those at risk, who require continuous health tracking without the burden of invasive procedures.
        </p>
      </div>
    </div>
  );
}

export default AboutUs;