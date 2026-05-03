from django.db import models
from users.models import User


class Incident(models.Model):
    disaster_type = models.CharField(max_length=100)
    severity = models.IntegerField()
    people_affected = models.IntegerField()
    description = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()

    priority_score = models.FloatField(null=True, blank=True)
    status = models.CharField(default="Pending", max_length=50)

    reported_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reported_incidents"
    )

    assigned_ngo = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_incidents"
    )

    def calculate_priority(self, risk_score=None):
        """Compute the priority score for this incident.

        If a pre-computed risk_score is provided (e.g. from the ML engine), it
        is factored into the formula described in the project requirements.
        Otherwise we fall back to a simple rule-based risk value.

        Final formula is:

            priority_score = (
                risk_score * 0.6 +
                severity * 5 +
                people_affected * 2
            )

        A bonus of 15 points is applied if the description contains any of
        the trigger words: "urgent", "trapped", "critical".
        The returned value is clamped between 0 and 100.
        """
        if risk_score is None:
            risk_score = self._rule_based_risk()

        score = (risk_score * 0.6) + (self.severity * 5) + (self.people_affected * 2)
        desc = self.description.lower() if self.description else ""
        if any(word in desc for word in ["urgent", "trapped", "critical"]):
            score += 15
        # clamp
        return max(0.0, min(score, 100.0))

    def _rule_based_risk(self):
        """Original simple calculation used when no ML model is available."""
        score = (self.severity * 3) + (self.people_affected * 2)
        if "urgent" in (self.description or "").lower():
            score += 10
        # scale into 0-100 range loosely
        return max(0.0, min(score, 100.0))