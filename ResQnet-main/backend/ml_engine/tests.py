from django.test import TestCase
from unittest.mock import patch
import numpy as np

from ml_engine.inference import run_disaster_model


class InferenceTests(TestCase):
    def test_rule_based_fallback(self):
        # use a disaster type for which no model exists
        result = run_disaster_model("nonexistent", {"severity": 3, "people_affected": 20, "latitude": 0, "longitude": 0})
        self.assertIn("risk_score", result)
        self.assertIn("confidence", result)
        # confidence should be zero for fallback
        self.assertEqual(result["confidence"], 0.0)
        self.assertGreaterEqual(result["risk_score"], 0.0)
        self.assertLessEqual(result["risk_score"], 100.0)

    @patch("ml_engine.model_loader.load_model")
    def test_inference_classification(self, mock_loader):
        class DummyClf:
            def predict_proba(self, X):
                return np.array([[0.2, 0.8]])
        mock_loader.return_value = DummyClf()
        result = run_disaster_model("any", {"severity": 1, "people_affected": 1, "latitude": 0, "longitude": 0})
        self.assertAlmostEqual(result["risk_score"], 80.0)
        self.assertAlmostEqual(result["confidence"], 0.8)

    @patch("ml_engine.model_loader.load_model")
    def test_inference_regression(self, mock_loader):
        class DummyReg:
            def predict(self, X):
                return np.array([42])
        mock_loader.return_value = DummyReg()
        result = run_disaster_model("any", {"severity": 1, "people_affected": 1, "latitude": 0, "longitude": 0})
        self.assertAlmostEqual(result["risk_score"], 42.0)
        self.assertEqual(result["confidence"], 1.0)
