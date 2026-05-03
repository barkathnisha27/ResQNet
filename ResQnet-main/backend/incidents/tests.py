from django.test import TestCase
from rest_framework.test import APIClient
from unittest.mock import patch

from users.models import User


class IncidentAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="u1", password="pass", role="citizen")
        self.ngo1 = User.objects.create_user(username="ngo1", password="pass", role="ngo")
        self.client.force_authenticate(user=self.user)

    @patch("ml_engine.inference.run_disaster_model")
    def test_create_incident_with_ml(self, mock_run):
        mock_run.return_value = {"risk_score": 80.0, "confidence": 0.9}
        data = {
            "disaster_type": "flood",
            "severity": 4,
            "people_affected": 50,
            "description": "urgent water rising",
            "latitude": 12.97,
            "longitude": 77.59,
        }
        resp = self.client.post("/api/incidents/create/", data, format="json")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data.get("risk_score"), 80.0)
        self.assertEqual(resp.data.get("model_used"), "flood")
        self.assertEqual(resp.data.get("assigned_ngo"), "ngo1")
        # priority should reflect ml output and formula
        self.assertIn("priority_score", resp.data)

    def test_fallback_priority_when_model_missing(self):
        # don't patch ML, let it default to fallback
        data = {
            "disaster_type": "unknown",
            "severity": 2,
            "people_affected": 10,
            "description": "no model available",
            "latitude": 0,
            "longitude": 0,
        }
        resp = self.client.post("/api/incidents/create/", data, format="json")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("priority_score", resp.data)
        self.assertIn("risk_score", resp.data)
