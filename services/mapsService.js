const axios = require('axios');

class MapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.isConfigured = !!this.apiKey;
    
    if (!this.isConfigured) {
      console.log('🗺️ Google Maps service not configured - API key missing');
    } else {
      console.log('🗺️ Google Maps service initialized');
    }
  }

  // Get directions between two points
  async getDirections(origin, destination, mode = 'driving') {
    if (!this.isConfigured) {
      return { success: false, error: 'Google Maps API not configured' };
    }

    try {
      const url = 'https://maps.googleapis.com/maps/api/directions/json';
      const params = {
        origin: typeof origin === 'object' ? `${origin.lat},${origin.lng}` : origin,
        destination: typeof destination === 'object' ? `${destination.lat},${destination.lng}` : destination,
        mode: mode, // driving, walking, bicycling, transit
        key: this.apiKey,
        language: 'id',
        region: 'id'
      };

      const response = await axios.get(url, { params });
      
      if (response.data.status !== 'OK') {
        return { success: false, error: response.data.error_message || 'Failed to get directions' };
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];

      return {
        success: true,
        data: {
          distance: leg.distance,
          duration: leg.duration,
          start_address: leg.start_address,
          end_address: leg.end_address,
          steps: leg.steps.map(step => ({
            instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
            distance: step.distance,
            duration: step.duration,
            start_location: step.start_location,
            end_location: step.end_location
          })),
          overview_polyline: route.overview_polyline.points
        }
      };

    } catch (error) {
      console.error('Google Maps directions error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get nearby places (futsal fields, parking, etc.)
  async getNearbyPlaces(location, type = 'gym', radius = 5000) {
    if (!this.isConfigured) {
      return { success: false, error: 'Google Maps API not configured' };
    }

    try {
      const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
      const params = {
        location: typeof location === 'object' ? `${location.lat},${location.lng}` : location,
        radius: radius,
        type: type,
        key: this.apiKey,
        language: 'id'
      };

      const response = await axios.get(url, { params });
      
      if (response.data.status !== 'OK') {
        return { success: false, error: response.data.error_message || 'Failed to get nearby places' };
      }

      return {
        success: true,
        data: response.data.results.map(place => ({
          place_id: place.place_id,
          name: place.name,
          vicinity: place.vicinity,
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
          price_level: place.price_level,
          location: place.geometry.location,
          types: place.types,
          opening_hours: place.opening_hours,
          photos: place.photos ? place.photos.map(photo => ({
            photo_reference: photo.photo_reference,
            width: photo.width,
            height: photo.height
          })) : []
        }))
      };

    } catch (error) {
      console.error('Google Maps nearby places error:', error);
      return { success: false, error: error.message };
    }
  }

  // Geocode address to coordinates
  async geocodeAddress(address) {
    if (!this.isConfigured) {
      return { success: false, error: 'Google Maps API not configured' };
    }

    try {
      const url = 'https://maps.googleapis.com/maps/api/geocode/json';
      const params = {
        address: address,
        key: this.apiKey,
        language: 'id',
        region: 'id'
      };

      const response = await axios.get(url, { params });
      
      if (response.data.status !== 'OK') {
        return { success: false, error: response.data.error_message || 'Failed to geocode address' };
      }

      const result = response.data.results[0];

      return {
        success: true,
        data: {
          formatted_address: result.formatted_address,
          location: result.geometry.location,
          place_id: result.place_id,
          types: result.types,
          address_components: result.address_components
        }
      };

    } catch (error) {
      console.error('Google Maps geocode error:', error);
      return { success: false, error: error.message };
    }
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(lat, lng) {
    if (!this.isConfigured) {
      return { success: false, error: 'Google Maps API not configured' };
    }

    try {
      const url = 'https://maps.googleapis.com/maps/api/geocode/json';
      const params = {
        latlng: `${lat},${lng}`,
        key: this.apiKey,
        language: 'id'
      };

      const response = await axios.get(url, { params });
      
      if (response.data.status !== 'OK') {
        return { success: false, error: response.data.error_message || 'Failed to reverse geocode' };
      }

      const result = response.data.results[0];

      return {
        success: true,
        data: {
          formatted_address: result.formatted_address,
          location: result.geometry.location,
          place_id: result.place_id,
          types: result.types,
          address_components: result.address_components
        }
      };

    } catch (error) {
      console.error('Google Maps reverse geocode error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get place details
  async getPlaceDetails(placeId) {
    if (!this.isConfigured) {
      return { success: false, error: 'Google Maps API not configured' };
    }

    try {
      const url = 'https://maps.googleapis.com/maps/api/place/details/json';
      const params = {
        place_id: placeId,
        fields: 'name,rating,formatted_phone_number,formatted_address,opening_hours,website,reviews,photos',
        key: this.apiKey,
        language: 'id'
      };

      const response = await axios.get(url, { params });
      
      if (response.data.status !== 'OK') {
        return { success: false, error: response.data.error_message || 'Failed to get place details' };
      }

      return {
        success: true,
        data: response.data.result
      };

    } catch (error) {
      console.error('Google Maps place details error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new MapsService();
