import os
import json
import re
import hashlib
import secrets
from pathlib import Path
from typing import Dict, Any
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# User storage directory & file
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
USERS_FILE = DATA_DIR / "users.json"


def _hash_password(password: str, salt: str = None) -> Dict[str, str]:
    """Generates a secure salted SHA-256 password hash."""
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return {"salt": salt, "hash": hashed}


def _verify_password(password: str, salt: str, hashed: str) -> bool:
    """Verifies a password against the stored salt and hash."""
    test_hash = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return secrets.compare_digest(test_hash, hashed)


def _load_users() -> Dict[str, Dict[str, str]]:
    """Loads users from persistent JSON file, initializing demo user if file doesn't exist."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    users = {}
    if USERS_FILE.exists():
        try:
            with open(USERS_FILE, "r", encoding="utf-8") as f:
                users = json.load(f)
        except Exception:
            users = {}

    # Ensure pre-seeded demo account exists
    demo_email = "demo@contentforge.ai"
    if demo_email not in users:
        demo_cred = _hash_password("password123")
        users[demo_email] = {
            "email": demo_email,
            "salt": demo_cred["salt"],
            "hash": demo_cred["hash"]
        }
        _save_users(users)

    return users


def _save_users(users: Dict[str, Dict[str, str]]):
    """Persists user dictionary to JSON file."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)


EMAIL_REGEX = re.compile(r"^[\w\.-]+@[\w\.-]+\.\w{2,}$")


class AuthRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
async def register(req: AuthRequest):
    email = req.email.strip().lower()
    password = req.password

    if not email or not password:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "error": "Email and password are required."}
        )

    if not EMAIL_REGEX.match(email):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "error": "Please enter a valid email address."}
        )

    if len(password) < 6:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "error": "Password must be at least 6 characters."}
        )

    users = _load_users()
    if email in users:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"success": False, "error": "An account with this email already exists."}
        )

    cred = _hash_password(password)
    users[email] = {
        "email": email,
        "salt": cred["salt"],
        "hash": cred["hash"]
    }
    _save_users(users)

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={"success": True, "message": "Account created successfully.", "email": email}
    )


@router.post("/login")
async def login(req: AuthRequest):
    email = req.email.strip().lower()
    password = req.password

    if not email or not password:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "error": "Email and password are required."}
        )

    users = _load_users()
    user_record = users.get(email)

    if not user_record:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"success": False, "error": "Invalid email or password."}
        )

    if not _verify_password(password, user_record["salt"], user_record["hash"]):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"success": False, "error": "Invalid email or password."}
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"success": True, "message": "Login successful.", "email": email}
    )

