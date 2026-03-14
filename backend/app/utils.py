import re
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import settings

_pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
NAME_REGEX = re.compile(r"^[A-Za-z ]+$")
PASSWORD_REGEX = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$"
)  # min 6 chars, 1 upper, 1 lower, 1 number, 1 symbol


def validate_email(email: str) -> bool:
    return EMAIL_REGEX.match(email) is not None


def validate_name(name: str) -> bool:
    # Allow spaces, letters only (no numbers, no symbols)
    return NAME_REGEX.match(name.strip()) is not None


def validate_password(password: str) -> bool:
    return PASSWORD_REGEX.match(password) is not None


def hash_password(password: str) -> str:
    return _pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return _pwd_context.verify(plain_password, hashed_password)


def _get_jwt_settings() -> tuple[str, str, int]:
    return settings.jwt_secret, settings.jwt_algorithm, settings.jwt_exp_minutes


def create_access_token(subject: str) -> str:
    secret, algorithm, exp_minutes = _get_jwt_settings()
    expire = datetime.utcnow() + timedelta(minutes=exp_minutes)
    to_encode = {"sub": str(subject), "exp": expire}
    return jwt.encode(to_encode, secret, algorithm=algorithm)


def decode_access_token(token: str) -> Optional[str]:
    secret, algorithm, _ = _get_jwt_settings()
    try:
        payload = jwt.decode(token, secret, algorithms=[algorithm])
        return payload.get("sub")
    except JWTError:
        return None
