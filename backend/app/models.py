from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False, default="EMPLOYEE")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    bookings = relationship("VisitorBooking", back_populates="employee", cascade="all, delete-orphan")


class VisitorBooking(Base):
    __tablename__ = "visitor_bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_code = Column(String(30), unique=True, index=True, nullable=False)
    visitor_name = Column(String(120), nullable=False)
    visitor_contact = Column(String(30), nullable=False)
    id_proof_type = Column(String(50), nullable=False)
    id_proof_number = Column(String(100), nullable=False)
    purpose = Column(Text, nullable=False)
    visit_date = Column(String(10), nullable=False)
    start_time = Column(String(5), nullable=False)
    end_time = Column(String(5), nullable=False)
    status = Column(String(20), nullable=False, default="PENDING")
    rejection_reason = Column(Text, nullable=True)
    qr_token = Column(String(80), unique=True, nullable=True)
    qr_data = Column(Text, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    employee = relationship("User", back_populates="bookings")
