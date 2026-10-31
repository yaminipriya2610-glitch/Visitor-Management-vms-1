from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)
    # Public self-registration is always Employee. Security Head accounts
    # should be created by an administrator, or by the local demo seed endpoint.
    role: str = "EMPLOYEE"

    @field_validator("role")
    @classmethod
    def valid_role(cls, value):
        value = value.upper()
        if value != "EMPLOYEE":
            raise ValueError("Public registration only supports the EMPLOYEE role")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class BookingCreate(BaseModel):
    visitor_name: str = Field(min_length=2, max_length=120)
    visitor_contact: str = Field(min_length=7, max_length=30)
    id_proof_type: str = Field(min_length=2, max_length=50)
    id_proof_number: str = Field(min_length=2, max_length=100)
    purpose: str = Field(min_length=2, max_length=500)
    visit_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    start_time: str = Field(pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    end_time: str = Field(pattern=r"^([01]\d|2[0-3]):[0-5]\d$")


class BookingDecision(BaseModel):
    rejection_reason: Optional[str] = Field(default=None, max_length=500)


class BookingOut(BaseModel):
    id: int
    booking_code: str
    visitor_name: str
    visitor_contact: str
    id_proof_type: str
    id_proof_number: str
    purpose: str
    visit_date: str
    start_time: str
    end_time: str
    status: str
    rejection_reason: Optional[str]
    qr_token: Optional[str]
    qr_data: Optional[str]
    approved_at: Optional[datetime]
    created_at: datetime
    employee_id: int
    employee_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class VerifyRequest(BaseModel):
    qr_token: str = Field(min_length=10, max_length=100)


class VerifyResponse(BaseModel):
    valid: bool
    message: str
    booking: Optional[BookingOut] = None
