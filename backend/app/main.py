from datetime import datetime
from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_
from .database import Base, engine, get_db
from .models import User, VisitorBooking
from .schemas import (
    UserCreate, LoginRequest, TokenResponse, UserOut, BookingCreate,
    BookingDecision, BookingOut, VerifyRequest, VerifyResponse
)
from .security import hash_password, verify_password, create_access_token, get_current_user, require_role
from .utils import generate_booking_code, generate_qr_token, make_qr_png, valid_date_time

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Online Visitor Management System API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def serialize_booking(booking: VisitorBooking):
    result = BookingOut.model_validate(booking)
    result.employee_name = booking.employee.name if booking.employee else None
    return result


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "visitor-management-api"}


@app.post("/api/auth/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(name=payload.name.strip(), email=payload.email.lower(), password_hash=hash_password(payload.password), role=payload.role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/api/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user.id, user.role)
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.get("/api/auth/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/api/bookings", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(payload: BookingCreate, current_user: User = Depends(require_role("EMPLOYEE")), db: Session = Depends(get_db)):
    ok, message = valid_date_time(payload.visit_date, payload.start_time, payload.end_time)
    if not ok:
        raise HTTPException(status_code=400, detail=message)
    booking = VisitorBooking(
        booking_code=generate_booking_code(),
        visitor_name=payload.visitor_name.strip(),
        visitor_contact=payload.visitor_contact.strip(),
        id_proof_type=payload.id_proof_type.strip(),
        id_proof_number=payload.id_proof_number.strip(),
        purpose=payload.purpose.strip(),
        visit_date=payload.visit_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        status="PENDING",
        employee_id=current_user.id,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return serialize_booking(booking)


@app.get("/api/bookings/my", response_model=list[BookingOut])
def my_bookings(current_user: User = Depends(require_role("EMPLOYEE")), db: Session = Depends(get_db)):
    bookings = db.query(VisitorBooking).filter(VisitorBooking.employee_id == current_user.id).order_by(VisitorBooking.created_at.desc()).all()
    return [serialize_booking(b) for b in bookings]


@app.get("/api/bookings/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.query(VisitorBooking).filter(VisitorBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if current_user.role == "EMPLOYEE" and booking.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only view your own bookings")
    return serialize_booking(booking)


@app.get("/api/security/bookings", response_model=list[BookingOut])
def security_bookings(status_filter: str | None = None, current_user: User = Depends(require_role("SECURITY_HEAD")), db: Session = Depends(get_db)):
    query = db.query(VisitorBooking).order_by(VisitorBooking.created_at.desc())
    if status_filter:
        normalized = status_filter.upper()
        if normalized not in {"PENDING", "APPROVED", "REJECTED"}:
            raise HTTPException(status_code=400, detail="Invalid status filter")
        query = query.filter(VisitorBooking.status == normalized)
    return [serialize_booking(b) for b in query.all()]


@app.post("/api/security/bookings/{booking_id}/approve", response_model=BookingOut)
def approve_booking(booking_id: int, current_user: User = Depends(require_role("SECURITY_HEAD")), db: Session = Depends(get_db)):
    booking = db.query(VisitorBooking).filter(VisitorBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != "PENDING":
        raise HTTPException(status_code=409, detail=f"Booking is already {booking.status.lower()}")
    booking.status = "APPROVED"
    booking.qr_token = generate_qr_token()
    booking.qr_data = f"VISITOR:{booking.booking_code}:{booking.qr_token}"
    booking.approved_at = datetime.utcnow()
    booking.rejection_reason = None
    db.commit()
    db.refresh(booking)
    return serialize_booking(booking)


@app.post("/api/security/bookings/{booking_id}/reject", response_model=BookingOut)
def reject_booking(booking_id: int, payload: BookingDecision, current_user: User = Depends(require_role("SECURITY_HEAD")), db: Session = Depends(get_db)):
    booking = db.query(VisitorBooking).filter(VisitorBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != "PENDING":
        raise HTTPException(status_code=409, detail=f"Booking is already {booking.status.lower()}")
    if not payload.rejection_reason or not payload.rejection_reason.strip():
        raise HTTPException(status_code=400, detail="Rejection reason is required")
    booking.status = "REJECTED"
    booking.rejection_reason = payload.rejection_reason.strip()
    booking.qr_token = None
    booking.qr_data = None
    db.commit()
    db.refresh(booking)
    return serialize_booking(booking)


@app.get("/api/bookings/{booking_id}/qr")
def download_qr(booking_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.query(VisitorBooking).filter(VisitorBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if current_user.role == "EMPLOYEE" and booking.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only download your own QR")
    if booking.status != "APPROVED" or not booking.qr_data:
        raise HTTPException(status_code=409, detail="QR is available only for approved bookings")
    png = make_qr_png(booking.qr_data)
    return Response(content=png, media_type="image/png", headers={"Content-Disposition": f'attachment; filename="{booking.booking_code}.png"'})


@app.post("/api/security/verify", response_model=VerifyResponse)
def verify_qr(payload: VerifyRequest, current_user: User = Depends(require_role("SECURITY_HEAD")), db: Session = Depends(get_db)):
    token = payload.qr_token.strip()
    if token.startswith("VISITOR:"):
        parts = token.split(":", 2)
        if len(parts) == 3:
            token = parts[2]
    booking = db.query(VisitorBooking).filter(VisitorBooking.qr_token == token).first()
    if not booking:
        return {"valid": False, "message": "Invalid QR token", "booking": None}
    if booking.status != "APPROVED":
        return {"valid": False, "message": "QR is not active", "booking": serialize_booking(booking)}
    return {"valid": True, "message": "Visitor verified successfully", "booking": serialize_booking(booking)}


@app.post("/api/dev/seed-demo")
def seed_demo(db: Session = Depends(get_db)):
    # Safe local-development helper. It is intentionally documented as a dev endpoint and should be removed before production deployment.
    created = []
    users = [
        ("Demo Employee", "employee@example.com", "employee123", "EMPLOYEE"),
        ("Demo Security Head", "security@example.com", "security123", "SECURITY_HEAD"),
    ]
    for name, email, password, role in users:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(name=name, email=email, password_hash=hash_password(password), role=role)
            db.add(user)
            db.flush()
            created.append(email)
    db.commit()
    return {"message": "Demo data ready", "created": created, "accounts": {"employee": "employee@example.com / employee123", "security": "security@example.com / security123"}}
