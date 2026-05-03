import os
import logging
from django.conf import settings

try:
    import joblib
except ImportError:
    joblib = None

# simple cache so models aren't reloaded on every request
MODEL_CACHE = {}

LOG = logging.getLogger(__name__)


def _find_model_dir(disaster_type: str) -> str | None:
    """Return the directory path for a disaster type if it exists.

    We look for both singular and plural directory names under
    `settings.BASE_DIR / models`.
    """
    base = os.path.join(settings.BASE_DIR, "models")
    candidates = [disaster_type.lower(), f"{disaster_type.lower()}s"]
    for name in candidates:
        path = os.path.join(base, name)
        if os.path.isdir(path):
            return path
    return None


def load_model(disaster_type: str):
    """Load and cache model artifacts for ``disaster_type``.

    Returns a dict with keys:
      - model: the loaded model object
      - scaler: optional scaler object (or None)
      - features: optional list of feature names (or None)
      - model_path: path to the model file

    Returns None when no directory/model is available or joblib is missing.
    """
    key = disaster_type.lower()
    if key in MODEL_CACHE:
        return MODEL_CACHE[key]

    if joblib is None:
        LOG.warning("joblib is not installed; cannot load ML models")
        return None

    model_dir = _find_model_dir(key)
    if not model_dir:
        LOG.warning(f"no model directory found for disaster type '{disaster_type}'")
        return None

    # find model file inside directory
    model_file = None
    for fname in os.listdir(model_dir):
        if fname.lower().endswith(('.pkl', '.joblib')):
            model_file = os.path.join(model_dir, fname)
            break

    if not model_file:
        LOG.warning(f"no model file found for disaster type '{disaster_type}' in {model_dir}")
        return None

    try:
        model = joblib.load(model_file)
    except Exception as exc:
        LOG.warning(f"failed loading model {model_file}: {exc}")
        return None

    # optional artifacts
    scaler = None
    features = None
    scaler_path = os.path.join(model_dir, "scaler.pkl")
    features_path = os.path.join(model_dir, "features.pkl")
    try:
        if os.path.exists(scaler_path):
            scaler = joblib.load(scaler_path)
    except Exception as exc:
        LOG.warning(f"failed loading scaler {scaler_path}: {exc}")

    try:
        if os.path.exists(features_path):
            features = joblib.load(features_path)
    except Exception as exc:
        LOG.warning(f"failed loading features list {features_path}: {exc}")

    info = {"model": model, "scaler": scaler, "features": features, "model_path": model_file}
    MODEL_CACHE[key] = info
    LOG.info(f"loaded model artifacts for {disaster_type} from {model_file}")
    return info