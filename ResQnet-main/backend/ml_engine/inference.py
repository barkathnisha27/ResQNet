import logging
from typing import Dict, Any

import numpy as np
import pandas as pd

from .model_loader import load_model

LOG = logging.getLogger(__name__)


# simple fallback risk calculator used when models are missing or fail

def _rule_based_risk(input_data: Dict[str, Any]) -> float:
    sev = input_data.get("severity", 0)
    pa = input_data.get("people_affected", 0)
    risk = (sev * 10) + (pa * 0.1)
    return max(0.0, min(risk, 100.0))



def run_disaster_model(disaster_type: str, input_data: Dict[str, Any]) -> Dict[str, float]:
    """Run the appropriate ML model and return normalized scores.

    ``input_data`` expected keys:
        severity, people_affected, latitude, longitude

    Returned dictionary contains:
        risk_score: float  # 0-100
        confidence: float # 0-1 (strength of prediction)
    """
    info = load_model(disaster_type)
    # default feature ordering used when model doesn't provide feature list
    default_features = ["severity", "people_affected", "latitude", "longitude"]

    try:
        if not info or "model" not in info:
            raise ValueError("no model available")

        model = info["model"]
        scaler = info.get("scaler")
        features_list = info.get("features") or default_features

        # prepare input: if features_list is present, create a DataFrame with those names
        if features_list:
            row = {name: float(input_data.get(name, 0)) if isinstance(input_data.get(name, 0), (int, float)) else 0.0 for name in features_list}
            X = pd.DataFrame([row], columns=features_list)
            X_input = X.values
        else:
            X_input = np.array([[input_data.get(f, 0) for f in default_features]])

        # apply scaler if present
        if scaler is not None:
            try:
                X_input = scaler.transform(X_input)
            except Exception:
                # if scaler expects pandas DataFrame/feature names, try passing DataFrame
                try:
                    if features_list:
                        X_input = scaler.transform(X)
                        X_input = np.asarray(X_input)
                except Exception:
                    LOG.warning("scaler.transform failed; continuing without scaling")

        # prediction
        if hasattr(model, "predict_proba"):
            proba = model.predict_proba(X_input)
            high_proba = float(proba[0][1] if proba.shape[1] > 1 else proba[0][0])
            risk_score = min(max(high_proba * 100.0, 0.0), 100.0)
            confidence = high_proba
        else:
            pred = float(model.predict(X_input)[0])
            risk_score = min(max(pred, 0.0), 100.0)
            confidence = 1.0

        return {"risk_score": risk_score, "confidence": confidence}
    except Exception as exc:
        LOG.warning(f"ML inference failed for {disaster_type}: {exc}")
        fallback = _rule_based_risk(input_data)
        return {"risk_score": fallback, "confidence": 0.0}