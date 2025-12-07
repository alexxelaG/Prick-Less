#!/bin/bash
# Simple MQTT Test Script
# Tests PPG data transmission without ESP32 hardware

echo "🧪 Testing MQTT PPG Data Transmission"
echo "=====================================

# Check if mosquitto is installed
if ! command -v mosquitto_pub &> /dev/null; then
    echo "❌ Mosquitto not installed. Run: brew install mosquitto"
    exit 1
fi

echo "✅ Mosquitto found"
echo "📡 Sending test PPG data..."

# Send 5 test messages
for i in {1..5}; do
    ppg_value=$((400 + RANDOM % 200))  # Random PPG value between 400-600
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    
    message="{\"ppg_value\": $ppg_value}"
    
    echo "📤 Sending: $message"
    mosquitto_pub -h localhost -t "prickless/ppg" -m "$message"
    
    sleep 2
done

echo ""
echo "🎉 Test complete! Check your dashboard for new data."
echo "💡 If no data appears:"
echo "   1. Make sure backend server is running"
echo "   2. Check backend logs for MQTT messages"
echo "   3. Refresh your dashboard"