"""
Analytics endpoints for retrieving agent metrics from Vapi
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from loguru import logger
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_user_optional
from app.models.user import User
from app.models.agent import Agent
from app.services.vapi_service import vapi_service

router = APIRouter()


@router.get("/agents/{agent_id}")
async def get_agent_analytics(
    agent_id: str,
    start_date: Optional[str] = Query(None, description="Start date (ISO 8601)"),
    end_date: Optional[str] = Query(None, description="End date (ISO 8601)"),
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get analytics for a specific agent

    Args:
        agent_id: Agent ID (local DB ID)
        start_date: Start date for analytics (ISO 8601 format)
        end_date: End date for analytics (ISO 8601 format)

    Returns:
        Analytics data including metrics
    """
    try:
        # Get agent from database
        agent = db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.user_id == current_user.id
        ).first()

        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        if not agent.vapi_assistant_id:
            # Return empty analytics if no Vapi assistant
            return {
                "total_calls": 0,
                "total_minutes": 0.0,
                "total_cost": 0.0,
                "avg_cost_per_call": 0.0,
                "avg_duration_minutes": 0.0,
                "successful_calls": 0,
                "success_rate": 0.0,
                "end_reasons": {},
                "calls": []
            }

        # Set default date range if not provided (last 30 days)
        if not end_date:
            end_date = datetime.utcnow().isoformat()
        if not start_date:
            start = datetime.utcnow() - timedelta(days=30)
            start_date = start.isoformat()

        # Get analytics from Vapi
        analytics = await vapi_service.get_analytics(
            assistant_id=agent.vapi_assistant_id,
            start_date=start_date,
            end_date=end_date
        )

        logger.info(f"Retrieved analytics for agent {agent_id}: {analytics.get('total_calls')} calls")
        return analytics

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving analytics for agent {agent_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve analytics: {str(e)}"
        )


@router.get("/all")
async def get_all_agents_analytics(
    start_date: Optional[str] = Query(None, description="Start date (ISO 8601)"),
    end_date: Optional[str] = Query(None, description="End date (ISO 8601)"),
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get analytics for all agents of the current user

    Args:
        start_date: Start date for analytics (ISO 8601 format)
        end_date: End date for analytics (ISO 8601 format)

    Returns:
        Combined analytics data for all agents
    """
    try:
        # Get all agents for the current user
        agents = db.query(Agent).filter(
            Agent.user_id == current_user.id,
            Agent.vapi_assistant_id.isnot(None)
        ).all()

        # Set default date range if not provided (last 30 days)
        if not end_date:
            end_date = datetime.utcnow().isoformat()
        if not start_date:
            start = datetime.utcnow() - timedelta(days=30)
            start_date = start.isoformat()

        # Aggregate analytics from all agents
        from collections import defaultdict

        total_metrics = {
            "total_calls": 0,
            "total_minutes": 0.0,
            "total_cost": 0.0,
            "successful_calls": 0,
            "end_reasons": {},
            "agents": []
        }

        # Time series aggregation
        daily_aggregates = defaultdict(lambda: {
            "date": "",
            "calls": 0,
            "minutes": 0,
            "cost": 0,
            "avg_cost": 0
        })

        # Duration by assistant aggregation
        all_assistant_durations = {}

        for agent in agents:
            analytics = await vapi_service.get_analytics(
                assistant_id=agent.vapi_assistant_id,
                start_date=start_date,
                end_date=end_date
            )

            # Add to totals
            total_metrics["total_calls"] += analytics.get("total_calls", 0)
            total_metrics["total_minutes"] += analytics.get("total_minutes", 0.0)
            total_metrics["total_cost"] += analytics.get("total_cost", 0.0)
            total_metrics["successful_calls"] += analytics.get("successful_calls", 0)

            # Merge end reasons
            for reason, count in analytics.get("end_reasons", {}).items():
                total_metrics["end_reasons"][reason] = total_metrics["end_reasons"].get(reason, 0) + count

            # Merge time series data
            for day_data in analytics.get("time_series", []):
                date_key = day_data["date"]
                daily_aggregates[date_key]["date"] = date_key
                daily_aggregates[date_key]["calls"] += day_data.get("calls", 0)
                daily_aggregates[date_key]["minutes"] += day_data.get("minutes", 0)
                daily_aggregates[date_key]["cost"] += day_data.get("cost", 0)

            # Merge assistant duration data (use agent name instead of assistant ID)
            for assistant_id, avg_duration in analytics.get("avg_duration_by_assistant", {}).items():
                all_assistant_durations[agent.name] = avg_duration

            # Add agent-specific data
            total_metrics["agents"].append({
                "id": agent.id,
                "name": agent.name,
                "vapi_assistant_id": agent.vapi_assistant_id,
                "analytics": analytics
            })

        # Calculate average cost per day
        for date_key in daily_aggregates:
            if daily_aggregates[date_key]["calls"] > 0:
                daily_aggregates[date_key]["avg_cost"] = round(
                    daily_aggregates[date_key]["cost"] / daily_aggregates[date_key]["calls"], 4
                )
            daily_aggregates[date_key]["minutes"] = round(daily_aggregates[date_key]["minutes"], 2)
            daily_aggregates[date_key]["cost"] = round(daily_aggregates[date_key]["cost"], 2)

        # Convert to sorted list
        total_metrics["time_series"] = sorted(daily_aggregates.values(), key=lambda x: x["date"])
        total_metrics["avg_duration_by_assistant"] = all_assistant_durations

        # Calculate averages
        if total_metrics["total_calls"] > 0:
            total_metrics["avg_cost_per_call"] = round(
                total_metrics["total_cost"] / total_metrics["total_calls"], 4
            )
            total_metrics["avg_duration_minutes"] = round(
                total_metrics["total_minutes"] / total_metrics["total_calls"], 2
            )
            total_metrics["success_rate"] = round(
                (total_metrics["successful_calls"] / total_metrics["total_calls"]) * 100, 2
            )
        else:
            total_metrics["avg_cost_per_call"] = 0.0
            total_metrics["avg_duration_minutes"] = 0.0
            total_metrics["success_rate"] = 0.0

        total_metrics["total_cost"] = round(total_metrics["total_cost"], 2)
        total_metrics["total_minutes"] = round(total_metrics["total_minutes"], 2)

        logger.info(f"Retrieved combined analytics: {total_metrics['total_calls']} calls across {len(agents)} agents")
        return total_metrics

    except Exception as e:
        logger.error(f"Error retrieving combined analytics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve analytics: {str(e)}"
        )
