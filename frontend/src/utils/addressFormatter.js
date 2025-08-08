/**
 * Utility function to safely format address objects for rendering
 * Handles both string addresses and address objects
 */

export const formatAddress = (address) => {
  if (!address) {
    return 'Address not available';
  }
  
  // If address is already a string, return it
  if (typeof address === 'string') {
    return address;
  }
  
  // If address is an object, format it
  if (typeof address === 'object') {
    const { street, city, state, pincode, country } = address;
    const parts = [];
    
    if (street) parts.push(street);
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (pincode) parts.push(pincode);
    if (country) parts.push(country);
    
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  }
  
  return 'Address not available';
};

/**
 * Format address for display in forms and lists
 */
export const formatAddressShort = (address) => {
  if (!address) {
    return 'Address not available';
  }
  
  // If address is already a string, return it
  if (typeof address === 'string') {
    return address;
  }
  
  // If address is an object, format it with fewer details
  if (typeof address === 'object') {
    const { city, state } = address;
    const parts = [];
    
    if (city) parts.push(city);
    if (state) parts.push(state);
    
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  }
  
  return 'Address not available';
}; 