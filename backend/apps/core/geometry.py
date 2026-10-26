import math
from typing import Dict, Any, List, Tuple
from shapely.geometry import shape, Point

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on the Earth surface in kilometers.
    """
    r = 6371.0  # Earth radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 2)

def is_point_inside_polygon(latitude: float, longitude: float, polygon_geojson: Dict[str, Any]) -> bool:
    """
    Check if a (lat, lon) point falls inside a GeoJSON Polygon / MultiPolygon.
    GeoJSON coordinates format is [longitude, latitude].
    """
    try:
        poly_shape = shape(polygon_geojson)
        pt = Point(longitude, latitude)
        return bool(poly_shape.contains(pt))
    except Exception:
        return False
