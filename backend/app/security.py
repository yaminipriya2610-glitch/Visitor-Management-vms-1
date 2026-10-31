import base64
import hashlib
import hmac
import json
import os
import time
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .config import settings
from .database import get_db
from .models import User

ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _unb64(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return f"scrypt${_b64(salt)}${_b64(digest)}"


def verify_password(plain_password: str, stored: str) -> bool:
    try:
        scheme, salt_b64, digest_b64 = stored.split("$", 2)
        if scheme != "scrypt":
            return False
        salt = _unb64(salt_b64)
        expected = _unb64(digest_b64)
        actual = hashlib.scrypt(plain_password.encode(), salt=salt, n=2**14, r=8, p=1)
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False


def create_access_token(user_id: int, role: str):
    header = {"alg": ALGORITHM, "typ": "JWT"}
    payload = {"sub": str(user_id), "role": role, "exp": int(time.time()) + settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60}
    encoded_header = _b64(json.dumps(header, separators=(",", ":")).encode())
    encoded_payload = _b64(json.dumps(payload, separators=(",", ":")).encode())
    unsigned = f"{encoded_header}.{encoded_payload}".encode()
    signature = hmac.new(settings.SECRET_KEY.encode(), unsigned, hashlib.sha256).digest()
    return f"{encoded_header}.{encoded_payload}.{_b64(signature)}"


def decode_access_token(token: str):
    try:
        header_b64, payload_b64, signature_b64 = token.split(".")
        unsigned = f"{header_b64}.{payload_b64}".encode()
        expected = hmac.new(settings.SECRET_KEY.encode(), unsigned, hashlib.sha256).digest()
        if not hmac.compare_digest(expected, _unb64(signature_b64)):
            raise ValueError("bad signature")
        header = json.loads(_unb64(header_b64))
        payload = json.loads(_unb64(payload_b64))
        if header.get("alg") != ALGORITHM or payload.get("exp", 0) < int(time.time()):
            raise ValueError("invalid token")
        return payload
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired authentication token", headers={"WWW-Authenticate":"Bearer"})


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid authentication token", headers={"WWW-Authenticate":"Bearer"})
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists", headers={"WWW-Authenticate":"Bearer"})
    return user


def require_role(role: str):
    def checker(current_user: User = Depends(get_current_user)):
        if current_user.role != role:
            raise HTTPException(status_code=403, detail=f"{role} role required")
        return current_user
    return checker
