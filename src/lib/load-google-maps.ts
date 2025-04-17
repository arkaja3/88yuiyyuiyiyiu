// Глобальное определение типа для window с Google Maps API
declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options: GoogleMapOptions) => GoogleMap;
        Marker: new (options: MarkerOptions) => Marker;
        DirectionsService: new () => DirectionsService;
        DirectionsRenderer: new (options?: DirectionsRendererOptions) => DirectionsRenderer;
        Geocoder: new () => Geocoder;
        GeocoderStatus: {
          OK: string;
        };
        TravelMode: {
          DRIVING: string;
        };
        LatLngBounds: new () => LatLngBounds;
      };
    };
    initGoogleMaps: () => void;
  }
}

// Типы для Google Maps API
interface GoogleMapOptions {
  center: { lat: number; lng: number };
  zoom: number;
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
  streetViewControl?: boolean;
  mapTypeControl?: boolean;
  fullscreenControl?: boolean;
}

interface GoogleMap {
  fitBounds(bounds: LatLngBounds): void;
}

interface MarkerOptions {
  position: { lat: number; lng: number };
  map: GoogleMap;
  icon?: {
    url: string;
  };
  title?: string;
}

interface Marker {
  setMap(map: GoogleMap | null): void;
  getPosition(): { lat(): number; lng(): number };
}

interface DirectionsService {
  route(
    request: DirectionsRequest,
    callback: (result: DirectionsResult, status: string) => void
  ): void;
}

interface DirectionsRequest {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  travelMode: string;
}

interface DirectionsResult {
  routes: Array<{
    legs: Array<{
      distance?: { text: string };
      duration?: { text: string };
    }>;
  }>;
}

interface DirectionsRendererOptions {
  map?: GoogleMap;
  suppressMarkers?: boolean;
  polylineOptions?: {
    strokeColor: string;
    strokeOpacity: number;
    strokeWeight: number;
  };
}

interface DirectionsRenderer {
  setDirections(result: DirectionsResult): void;
}

interface Geocoder {
  geocode(
    request: { address: string },
    callback: (results: GeocodeResult[], status: string) => void
  ): void;
}

interface GeocodeResult {
  geometry: {
    location: {
      lat(): number;
      lng(): number;
    };
  };
}

interface LatLngBounds {
  extend(latLng: { lat: number; lng: number }): void;
}

let isLoading = false;
let isLoaded = false;

// Функция для загрузки Google Maps API
export const loadGoogleMapsApi = (apiKey: string): Promise<void> => {
  // Если API уже загружен, возвращаем разрешенный Promise
  if (isLoaded) {
    return Promise.resolve();
  }

  // Если API загружается, возвращаем Promise, который разрешится, когда API будет загружен
  if (isLoading) {
    return new Promise((resolve) => {
      const checkLoaded = setInterval(() => {
        if (isLoaded) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
    });
  }

  // Если API еще не загружается, начинаем загрузку
  isLoading = true;

  return new Promise((resolve, reject) => {
    try {
      // Создаем функцию инициализации, которая будет вызвана Google Maps API
      window.initGoogleMaps = () => {
        isLoaded = true;
        isLoading = false;
        resolve();
      };

      // Создаем и добавляем скрипт для загрузки Google Maps API
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      script.onerror = (error) => {
        isLoading = false;
        reject(new Error(`Failed to load Google Maps API: ${error}`));
      };

      document.head.appendChild(script);
    } catch (error) {
      isLoading = false;
      reject(error);
    }
  });
};

// Функция для проверки доступности Google Maps API
export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded;
};

// Функция для получения координат города или адреса через API геокодирования
export const getCoordinates = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  if (!isLoaded) {
    console.error('Google Maps API not loaded');
    return null;
  }

  try {
    const geocoder = new window.google.maps.Geocoder();
    const result = await new Promise<GeocodeResult>((resolve, reject) => {
      geocoder.geocode({ address }, (results: GeocodeResult[], status: string) => {
        if (status === 'OK' && results && results.length > 0) {
          resolve(results[0]);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });

    const location = result.geometry.location;
    return { lat: location.lat(), lng: location.lng() };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};
