import secrets
from datetime import date, datetime
from io import BytesIO
import qrcode


def generate_booking_code() -> str:
    return "VIS-" + datetime.utcnow().strftime("%Y%m%d") + "-" + secrets.token_hex(3).upper()


def generate_qr_token() -> str:
    return secrets.token_urlsafe(32)


def make_qr_png(data: str) -> bytes:
    img = qrcode.make(data)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()


def valid_date_time(visit_date: str, start_time: str, end_time: str):
    try:
        visit = date.fromisoformat(visit_date)
        start = datetime.strptime(start_time, "%H:%M").time()
        end = datetime.strptime(end_time, "%H:%M").time()
    except ValueError:
        return False, "Invalid date or time format"
    if end <= start:
        return False, "End time must be after start time"
    if visit < date.today():
        return False, "Visit date cannot be in the past"
    return True, ""
