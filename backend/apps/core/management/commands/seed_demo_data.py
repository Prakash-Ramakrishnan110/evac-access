"""
Django management command to seed synthetic demo data for EvacAccess India.
Run with: python manage.py seed_demo_data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import User, UserRole
from incidents.models import Incident, HazardZone, IncidentScenario, IncidentStatus
from shelters.models import Shelter, ShelterFeature, OperatingStatus, ShelterReviewStatus, FeatureValue
from assistance.models import AssistanceRequest, UrgencyLevel, RequestStatus
from routing.models import RouteCandidate, RouteSegment
from alerts.models import Alert, AlertFormat, AlertStatus

class Command(BaseCommand):
    help = 'Seeds realistic disaster simulation data for Scenario EA-1001'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Initializing EvacAccess India simulation seed..."))

        # 1. Create Core Users
        users_data = [
            ("admin", "admin@evacaccess.gov.in", "admin12345", UserRole.ADMIN, "State Disaster Management Authority"),
            ("priya_coordinator", "priya.sharma@odrf.gov.in", "coordinator123", UserRole.COORDINATOR, "ODRF Incident Control"),
            ("rajesh_responder", "rajesh.jena@odrf.gov.in", "responder123", UserRole.RESPONDER, "ODRF Rapid Action Unit 1"),
            ("sunita_reviewer", "sunita.das@municipal.gov.in", "reviewer123", UserRole.REVIEWER, "Puri Municipal Accessibility Cell"),
            ("demo_viewer", "observer@disaster.in", "viewer123", UserRole.DEMO_VIEWER, "National Emergency Observation Post"),
        ]

        created_users = {}
        for username, email, password, role, org in users_data:
            user, created = User.objects.get_or_create(username=username, defaults={
                "email": email,
                "role": role,
                "organization": org,
                "is_active": True,
                "badge_number": f"ODRF-{username[:4].upper()}"
            })
            user.set_password(password)
            user.role = role
            user.save()
            created_users[username] = user
            if created:
                self.stdout.write(f"  + User created: {username} ({role})")

        # 2. Create Incident: Puri Coastal Flooding
        incident, _ = Incident.objects.get_or_create(
            code="ODISHA-PURI-FLOOD-2026",
            defaults={
                "title": "Puri Coastal Inundation Emergency Simulation",
                "description": "Monsoon depression induced high tide surge resulting in localized 30-45cm inundation across low-lying coastal wards.",
                "scenario_type": IncidentScenario.FLOOD,
                "status": IncidentStatus.ACTIVE_DEMO,
                "center_latitude": 19.8050,
                "center_longitude": 85.8250,
                "default_zoom": 13,
                "hazard_source": "OSDMA Integrated Coastal Radar Feed",
                "hazard_observed_at": timezone.now(),
                "is_demo_data": True,
                "created_by": created_users["priya_coordinator"],
                "affected_area_geojson": {
                    "type": "Polygon",
                    "coordinates": [[
                        [85.805, 19.795],
                        [85.845, 19.795],
                        [85.850, 19.825],
                        [85.810, 19.825],
                        [85.805, 19.795]
                    ]]
                }
            }
        )
        self.stdout.write(f"  + Incident ready: {incident.code}")

        # 3. Create Hazard Zone
        hazard, _ = HazardZone.objects.get_or_create(
            incident=incident,
            zone_name="Baliapanda Lowland Waterlogging Zone",
            defaults={
                "severity": "HIGH",
                "water_depth_cm": 35,
                "geometry_geojson": {
                    "type": "Polygon",
                    "coordinates": [[
                        [85.810, 19.798],
                        [85.825, 19.798],
                        [85.825, 19.810],
                        [85.810, 19.810],
                        [85.810, 19.798]
                    ]]
                },
                "notes": "Surge overflow along coastal drainage channels."
            }
        )

        # 4. Create 3 Distinct Shelters
        shelters_info = [
            {
                "code": "SH-PURI-01",
                "name": "Puri High School Cyclone Center",
                "address": "Station Road, Ward 5, Puri",
                "lat": 19.8180,
                "lng": 85.8320,
                "total": 300,
                "occupied": 140,
                "review": ShelterReviewStatus.VERIFIED,
                "features": {
                    "step_free_access": FeatureValue.NO,
                    "wheelchair_ramp": FeatureValue.NO,
                    "accessible_restroom": FeatureValue.NO,
                    "backup_power_for_oxygen": FeatureValue.YES,
                    "ground_floor_sheltering": FeatureValue.NO
                }
            },
            {
                "code": "SH-PURI-02",
                "name": "Community Hall Sector 4",
                "address": "Marine Drive Approach, Puri",
                "lat": 19.8010,
                "lng": 85.8190,
                "total": 180,
                "occupied": 45,
                "review": ShelterReviewStatus.VERIFIED,
                "features": {
                    "step_free_access": FeatureValue.YES,
                    "wheelchair_ramp": FeatureValue.YES,
                    "accessible_restroom": FeatureValue.YES,
                    "backup_power_for_oxygen": FeatureValue.YES,
                    "ground_floor_sheltering": FeatureValue.YES
                }
            },
            {
                "code": "SH-PURI-03",
                "name": "Jagannath Multipurpose Cyclone Shelter",
                "address": "Grand Road Elevated Sector, Puri",
                "lat": 19.8140,
                "lng": 85.8240,
                "total": 500,
                "occupied": 210,
                "review": ShelterReviewStatus.VERIFIED,
                "features": {
                    "step_free_access": FeatureValue.YES,
                    "wheelchair_ramp": FeatureValue.YES,
                    "accessible_restroom": FeatureValue.YES,
                    "backup_power_for_oxygen": FeatureValue.YES,
                    "tactile_paving": FeatureValue.YES,
                    "ground_floor_sheltering": FeatureValue.YES
                }
            }
        ]

        shelters_map = {}
        for s in shelters_info:
            sh, _ = Shelter.objects.get_or_create(
                code=s["code"],
                defaults={
                    "incident": incident,
                    "name": s["name"],
                    "address": s["address"],
                    "latitude": s["lat"],
                    "longitude": s["lng"],
                    "capacity_total": s["total"],
                    "capacity_occupied": s["occupied"],
                    "operating_status": OperatingStatus.OPEN,
                    "review_status": s["review"],
                    "last_verified_at": timezone.now(),
                    "verified_by": created_users["sunita_reviewer"],
                    "source": "ODRF Field Safety Audit"
                }
            )
            shelters_map[s["code"]] = sh
            for f_key, f_val in s["features"].items():
                ShelterFeature.objects.update_or_create(
                    shelter=sh,
                    feature_key=f_key,
                    defaults={"value": f_val, "verified_by": created_users["sunita_reviewer"], "verified_at": timezone.now()}
                )
            self.stdout.write(f"  + Shelter ready: {sh.name} ({sh.code})")

        # 5. Create Core Assistance Request EA-1001
        req1, _ = AssistanceRequest.objects.get_or_create(
            public_ref="EA-1001",
            defaults={
                "incident": incident,
                "urgency": UrgencyLevel.HIGH_PRIORITY,
                "status": RequestStatus.NEW,
                "requirements": ["wheelchair", "step_free_access", "oxygen_electricity"],
                "number_of_people": 2,
                "approximate_address": "Baliapanda Ward 12, Near Sea Beach Post",
                "latitude": 19.7995,
                "longitude": 85.8145,
                "contact_phone_masked": "XXXXXX-4521",
                "operational_notes": "Elderly citizen using electric wheelchair; requires oxygen concentrator electricity."
            }
        )

        # Additional requests for realism
        req2, _ = AssistanceRequest.objects.get_or_create(
            public_ref="EA-1002",
            defaults={
                "incident": incident,
                "urgency": UrgencyLevel.CRITICAL_LIFE_THREAT,
                "status": RequestStatus.NEW,
                "requirements": ["stretcher", "oxygen_electricity"],
                "number_of_people": 1,
                "approximate_address": "Swargadwar Road, Ward 8",
                "latitude": 19.8040,
                "longitude": 85.8200,
                "contact_phone_masked": "XXXXXX-8910",
                "operational_notes": "Bedridden stroke recovery patient; requires medical stretcher transport."
            }
        )

        req3, _ = AssistanceRequest.objects.get_or_create(
            public_ref="EA-1003",
            defaults={
                "incident": incident,
                "urgency": UrgencyLevel.STANDARD,
                "status": RequestStatus.NEW,
                "requirements": ["visual_assistance"],
                "number_of_people": 3,
                "approximate_address": "Chakratirtha Road, Ward 3",
                "latitude": 19.8100,
                "longitude": 85.8350,
                "contact_phone_masked": "XXXXXX-3141",
                "operational_notes": "Visually impaired family head with two dependents."
            }
        )
        self.stdout.write("  + Assistance requests seeded: EA-1001, EA-1002, EA-1003")

        # 6. Create Candidate Routes from EA-1001 Origin
        # Candidate 1: To SH-PURI-01 (Fails shelter ramp)
        r1, _ = RouteCandidate.objects.get_or_create(
            candidate_code="ROUTE-DEMO-01",
            defaults={
                "incident": incident,
                "title": "Station Link via Hospital Road",
                "origin_name": "Baliapanda Ward 12",
                "origin_latitude": 19.7995,
                "origin_longitude": 85.8145,
                "destination_shelter": shelters_map["SH-PURI-01"],
                "distance_km": 3.2,
                "estimated_time_minutes": 18,
                "geometry_geojson": {
                    "type": "LineString",
                    "coordinates": [[85.8145, 19.7995], [85.8220, 19.8080], [85.8320, 19.8180]]
                },
                "source": "ODRF Rapid Navigation GIS"
            }
        )
        RouteSegment.objects.get_or_create(
            route=r1,
            segment_code="SEG-HL-01",
            defaults={
                "name": "Hospital Road Link",
                "condition": "CLEAR",
                "is_flooded": False,
                "water_depth_cm": 0,
                "has_stairs_or_curbs": False
            }
        )

        # Candidate 2: To SH-PURI-02 (Fails because Coastal Road segment is flooded 35cm)
        r2, _ = RouteCandidate.objects.get_or_create(
            candidate_code="ROUTE-DEMO-02",
            defaults={
                "incident": incident,
                "title": "Coastal Route via Marine Drive",
                "origin_name": "Baliapanda Ward 12",
                "origin_latitude": 19.7995,
                "origin_longitude": 85.8145,
                "destination_shelter": shelters_map["SH-PURI-02"],
                "distance_km": 1.4,
                "estimated_time_minutes": 8,
                "geometry_geojson": {
                    "type": "LineString",
                    "coordinates": [[85.8145, 19.7995], [85.8160, 19.8000], [85.8190, 19.8010]]
                },
                "source": "ODRF Rapid Navigation GIS"
            }
        )
        RouteSegment.objects.get_or_create(
            route=r2,
            segment_code="SEG-CR-02",
            defaults={
                "name": "Marine Drive Coastal Stretch",
                "condition": "WATERLOGGED",
                "is_flooded": True,
                "water_depth_cm": 35,
                "has_stairs_or_curbs": False
            }
        )

        # Candidate 3: To SH-PURI-03 (Elevated corridor, fully feasible)
        r3, _ = RouteCandidate.objects.get_or_create(
            candidate_code="ROUTE-DEMO-03",
            defaults={
                "incident": incident,
                "title": "Grand Road Elevated Emergency Corridor",
                "origin_name": "Baliapanda Ward 12",
                "origin_latitude": 19.7995,
                "origin_longitude": 85.8145,
                "destination_shelter": shelters_map["SH-PURI-03"],
                "distance_km": 2.1,
                "estimated_time_minutes": 12,
                "geometry_geojson": {
                    "type": "LineString",
                    "coordinates": [[85.8145, 19.7995], [85.8180, 19.8050], [85.8240, 19.8140]]
                },
                "source": "ODRF Rapid Navigation GIS"
            }
        )
        RouteSegment.objects.get_or_create(
            route=r3,
            segment_code="SEG-GR-01",
            defaults={
                "name": "Grand Road Elevated Flyover Section",
                "condition": "CLEAR",
                "is_flooded": False,
                "water_depth_cm": 0,
                "has_stairs_or_curbs": False
            }
        )
        self.stdout.write("  + Route candidates seeded: ROUTE-DEMO-01, ROUTE-DEMO-02, ROUTE-DEMO-03")

        # 7. Seed Sample Alert
        alert, _ = Alert.objects.get_or_create(
            incident=incident,
            title="Urgent Lowland Evacuation Advisory",
            defaults={
                "target_zone": "Baliapanda Coastal Ward 12 & 14",
                "message_en": "High tide flood surge expected between 22:00 and 02:00. Citizens requiring wheelchair or medical electrical support are advised to evacuate immediately to Jagannath Multipurpose Cyclone Shelter via Grand Road.",
                "message_hi": "रात 10 बजे से 2 बजे के बीच उच्च ज्वार बाढ़ की संभावना है। व्हीलचेयर या चिकित्सा ऑक्सीजन की आवश्यकता वाले नागरिकों को तुरंत ग्रैंड रोड के माध्यम से जगन्नाथ चक्रवात आश्रय में जाने की सलाह दी जाती है।",
                "message_or": "ରାତି ୧୦ଟାରୁ ୨ଟା ମଧ୍ୟରେ ଉଚ୍ଚ ଜୁଆର ବନ୍ୟା ଆଶଙ୍କା। ହ୍ୱିଲଚେୟାର କିମ୍ବା ଡାକ୍ତରୀ ସହାୟତା ଆବଶ୍ୟକ କରୁଥିବା ନାଗରିକମାନଙ୍କୁ ତୁରନ୍ତ ଗ୍ରାଣ୍ଡ ରୋଡ ଦେଇ ଜଗନ୍ନାଥ ଆଶ୍ରୟସ୍ଥଳକୁ ଯିବାକୁ ଅନୁରୋଧ।",
                "preferred_format": AlertFormat.HIGH_CONTRAST_LARGE_TEXT,
                "status": AlertStatus.PREVIEWED,
                "is_simulated_preview": True
            }
        )
        self.stdout.write("  + Sample accessible alert seeded.")

        self.stdout.write(self.style.SUCCESS("[SUCCESS] Seed completed! Scenario EA-1001 is ready for demonstration."))
