"""Analytics, AI Insights, Data Export, and Profile Badge API endpoints."""

from fastapi import APIRouter, Query, Response
from fastapi.responses import Response
from ..services.analytics_service import (
    export_followers_data,
    generate_svg_badge,
    get_ai_insights,
    get_audience_quality,
    get_growth_forecast,
    get_repository_opportunity_radar,
    get_smart_alerts,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/ai-insights")
def ai_insights():
    """Get AI audience insights & health evaluation."""
    return get_ai_insights()


@router.get("/quality")
def audience_quality():
    """Return an audience quality score with actionable recommendations."""
    return get_audience_quality()


@router.get("/opportunities")
def repository_opportunities():
    """Rank repositories by growth potential and attention."""
    return get_repository_opportunity_radar()


@router.get("/forecast")
def growth_forecast():
    """Project follower totals from recent observed daily growth."""
    return get_growth_forecast()


@router.get("/alerts")
def smart_alerts():
    """Return explainable audience, repository, and sync alerts."""
    return get_smart_alerts()


@router.get("/export")
def export_data(format: str = Query("csv", regex="^(csv|json)$")):
    """Export audience snapshots to CSV or JSON."""
    content, media_type, filename = export_followers_data(export_format=format)
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return Response(content=content, media_type=media_type, headers=headers)


@router.get("/badge/followers")
def follower_badge():
    """Returns a live SVG badge for embedding in GitHub READMEs."""
    svg_content = generate_svg_badge()
    return Response(
        content=svg_content,
        media_type="image/svg+xml",
        headers={"Cache-Control": "max-age=300"},
    )
