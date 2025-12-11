"""
Tool Schemas
Pydantic models for tool validation and serialization
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class ToolParameterProperty(BaseModel):
    """Schema for a tool parameter property"""
    type: str = Field(..., description="Type of the parameter (string, number, boolean, etc.)")
    description: Optional[str] = Field(None, description="Description of the parameter")
    enum: Optional[List[str]] = Field(None, description="Allowed values for enum types")


class ToolParameters(BaseModel):
    """Schema for tool parameters"""
    type: str = Field(default="object", description="Type of parameters object")
    properties: Dict[str, ToolParameterProperty] = Field(..., description="Parameter definitions")
    required: Optional[List[str]] = Field(default=[], description="Required parameter names")


class ToolMessages(BaseModel):
    """Custom messages for tool execution"""
    request_start: Optional[str] = Field(None, description="Message when tool starts executing")
    request_complete: Optional[str] = Field(None, description="Message when tool completes")
    request_failed: Optional[str] = Field(None, description="Message when tool fails")
    request_delayed: Optional[str] = Field(None, description="Message when tool is delayed")


class ToolBase(BaseModel):
    """Base tool schema"""
    name: str = Field(..., min_length=1, max_length=100, description="Tool name")
    description: Optional[str] = Field(None, description="Tool description")
    type: str = Field(default="function", description="Tool type")


class ToolCreate(ToolBase):
    """Schema for creating a new tool"""
    function_name: Optional[str] = Field(None, description="Function name")
    function_description: Optional[str] = Field(None, description="Function description")
    parameters: Optional[ToolParameters] = Field(None, description="Function parameters")
    server_url: Optional[str] = Field(None, description="Server webhook URL")
    server_timeout: Optional[int] = Field(default=20, description="Server timeout in seconds")
    messages: Optional[ToolMessages] = Field(None, description="Custom messages")
    async_mode: Optional[bool] = Field(default=False, description="Enable async mode")


class ToolUpdate(BaseModel):
    """Schema for updating a tool"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    function_name: Optional[str] = None
    function_description: Optional[str] = None
    parameters: Optional[ToolParameters] = None
    server_url: Optional[str] = None
    server_timeout: Optional[int] = None
    messages: Optional[ToolMessages] = None
    async_mode: Optional[bool] = None


class ToolResponse(ToolBase):
    """Schema for tool responses"""
    id: str
    user_id: str
    vapi_tool_id: Optional[str] = None
    function_name: Optional[str] = None
    function_description: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    server_url: Optional[str] = None
    server_timeout: int
    messages: Optional[Dict[str, Any]] = None
    async_mode: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Webhook request/response schemas
class ToolCallArguments(BaseModel):
    """Arguments passed to a tool call"""
    pass  # Dynamic based on tool definition


class ToolCall(BaseModel):
    """Information about a single tool call"""
    id: str
    name: str
    arguments: Dict[str, Any]


class ToolCallRequest(BaseModel):
    """Webhook request from Vapi for tool execution"""
    message: Dict[str, Any]  # Full Vapi message object


class ToolCallResultItem(BaseModel):
    """Result for a single tool call"""
    toolCallId: str
    result: Any  # Can be string, number, object, array, etc.


class ToolCallResponse(BaseModel):
    """Webhook response to Vapi with tool results"""
    results: List[ToolCallResultItem]


# Google Calendar specific schemas
class CalendarEventCreate(BaseModel):
    """Schema for creating a calendar event"""
    client_name: str = Field(..., description="Name of the client")
    date: str = Field(..., description="Date of appointment (YYYY-MM-DD)")
    time: str = Field(..., description="Time of appointment (HH:MM)")
    duration: Optional[int] = Field(default=60, description="Duration in minutes")
    service: Optional[str] = Field(None, description="Type of service")
    notes: Optional[str] = Field(None, description="Additional notes")
