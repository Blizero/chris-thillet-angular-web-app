export interface SatelliteOrbit {
  id: string;
  apogee_km: number;
  perigee_km: number;
  inclination_deg: number;
  longitude_geo_deg: number;
  period_min: number;
  eccentricity: number;
  class_of_orbit: string;
}
