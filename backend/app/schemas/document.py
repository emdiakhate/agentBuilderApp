from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class DocumentResponse(BaseModel):
    id: str
    agent_id: str
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    status: str
    error_message: Optional[str]
    num_chunks: int
    total_tokens: int
    metadata: Optional[Dict[str, Any]]
    uploaded_at: datetime
    processed_at: Optional[datetime]

    class Config:
        from_attributes = True
