/**
 * Utility functions for calculating distances and travel times between geographic coordinates
 */

/**
 * Calculate the distance between two points using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees to convert
 * @returns {number} Radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate estimated travel time based on distance and vehicle type
 * @param {number} distance - Distance in kilometers
 * @param {string} vehicleType - Type of vehicle ('Truck', 'Van', or 'Motorcycle')
 * @returns {number} Estimated travel time in minutes
 */
function calculateTravelTime(distance, vehicleType = 'Truck') {
  // Average speeds for different vehicle types (km/h)
  const speeds = {
    'Truck': 60,        // Trucks typically travel at 60 km/h on highways
    'Van': 70,          // Vans are slightly faster
    'Motorcycle': 35    // Motorcycles in city traffic
  };
  
  const speed = speeds[vehicleType] || speeds['Truck'];
  const timeInHours = distance / speed;
  const timeInMinutes = timeInHours * 60;
  
  // Add buffer time based on vehicle type and distance
  let bufferTime;
  if (vehicleType === 'Motorcycle') {
    // For motorcycles in city: more realistic buffer for traffic, stops, etc.
    bufferTime = Math.max(10, distance * 3); // Minimum 10 minutes, or 3 minutes per km
  } else {
    // For trucks/vans: highway and city mix
    bufferTime = Math.max(30, distance * 2); // Minimum 30 minutes, or 2 minutes per km
  }
  
  return Math.round(timeInMinutes + bufferTime);
}

/**
 * Calculate total route distance and time for multiple stops
 * @param {Array} stops - Array of stops with coordinates
 * @param {string} vehicleType - Type of vehicle
 * @returns {Object} Total distance and estimated time
 */
function calculateRouteMetrics(stops, vehicleType = 'Truck') {
  if (stops.length < 2) {
    return { totalDistance: 0, totalTime: 0 };
  }
  
  let totalDistance = 0;
  let totalTime = 0;
  
  for (let i = 0; i < stops.length - 1; i++) {
    const currentStop = stops[i];
    const nextStop = stops[i + 1];
    
    const distance = calculateDistance(
      currentStop.latitude,
      currentStop.longitude,
      nextStop.latitude,
      nextStop.longitude
    );
    
    const time = calculateTravelTime(distance, vehicleType);
    
    totalDistance += distance;
    totalTime += time;
  }
  
  return {
    totalDistance: Math.round(totalDistance * 100) / 100,
    totalTime: Math.round(totalTime)
  };
}

module.exports = {
  calculateDistance,
  calculateTravelTime,
  calculateRouteMetrics,
  toRadians
};
