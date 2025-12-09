from marshmallow import Schema, fields


class SafeFloat(fields.Field):
    """Float field that tolerates comma decimals like '0,0' and returns None on failure."""

    def _serialize(self, value, attr, obj, **kwargs):
        if value in (None, ""):
            return None
        if isinstance(value, (int, float)):
            return float(value)

        if isinstance(value, str):
            # replace comma decimal separator, handle e.g. '1,75E-03'
            v = value.replace(",", ".")
            try:
                return float(v)
            except ValueError:
                return None

        return None


class SatelliteSchema(Schema):
    id = fields.Str(attribute="_id")
    name = fields.Str(attribute="Name_of_Satellite,_Alternate_Names")

    # identity fields...

    # Orbit info
    class_of_orbit = fields.Str(attribute="Class of Orbit")
    type_of_orbit = fields.Str(attribute="Type of Orbit", allow_none=True, missing=None)

    longitude_geo_deg = SafeFloat(attribute="Longitude of GEO (degrees)", allow_none=True)
    perigee_km = SafeFloat(attribute="Perigee (km)")
    apogee_km = SafeFloat(attribute="Apogee (km)")
    eccentricity = SafeFloat(attribute="Eccentricity", allow_none=True)
    inclination_deg = SafeFloat(attribute="Inclination (degrees)", allow_none=True)
    period_min = SafeFloat(attribute="Period (minutes)", allow_none=True)

    mission_type = fields.Str(attribute="Mission_Type", allow_none=True, missing=None)
    
    
    
    
class ChatMessageSchema(Schema):
    _id = fields.Str()
    username = fields.Str()
    prompt = fields.Str()
    response = fields.Str()
    time = fields.Str()