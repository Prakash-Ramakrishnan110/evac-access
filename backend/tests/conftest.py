import sys
from pathlib import Path
import pytest
from django.core.management import call_command

# Ensure backend and backend/apps are on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
apps_path = str(BASE_DIR / 'apps')
backend_path = str(BASE_DIR)
if apps_path not in sys.path:
    sys.path.insert(0, apps_path)
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

@pytest.fixture(autouse=True)
def seed_scenario_data(db):
    """
    Automatically seed Scenario EA-1001 into the test database before each test.
    """
    call_command('seed_demo_data')
