import User from "../../user/user.model";

const filterUsersByLocation = async (users: any[], currentUserId: string) => {
  const currentUser = await User.findById(currentUserId);
  if (
    !currentUser ||
    !currentUser.currentLocation ||
    !currentUser.currentLocation.latitude ||
    !currentUser.currentLocation.longitude
  ) {
    throw new Error("Current user's location is not properly specified");
  }

  const { latitude, longitude } = currentUser.currentLocation;

  // Use the Haversine formula or a geospatial library if needed
  // Here we assume that the database handles geospatial queries directly
  return users.filter((user) => {
    // Calculate distance between the two locations
    // and check if it's within 100 km
    // This is a placeholder; you can implement a proper distance calculation
    const distance = calculateDistance(
      latitude,
      longitude,
      user.currentLocation.latitude,
      user.currentLocation.longitude
    );
    return distance <= 100; // Distance in km
  });
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  // Haversine formula to calculate the distance between two points
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export { filterUsersByLocation };
