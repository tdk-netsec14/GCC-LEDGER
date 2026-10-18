from typing import Annotated

from fastapi import Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import decode_access_token
from app.database import get_db
from app.models.entities import ReviewerUser

security = HTTPBearer(auto_error=False)


def get_evidence_params(
    floor: Annotated[str, Query(description="Evidence floor (A, B, C, D)", pattern="^(A|B|C|D|a|b|c|d)$")] = "D",
    direct_only: Annotated[bool, Query(description="Exclude relayed claims")] = False,
) -> tuple[str, bool]:
    return floor.upper(), direct_only


def get_current_reviewer(
    auth: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Annotated[Session, Depends(get_db)],
) -> ReviewerUser:
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required for reviewer actions.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = decode_access_token(auth.credentials)
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload.")
    except Exception:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token validation failed or expired.")

    user = db.execute(select(ReviewerUser).where(ReviewerUser.username == username)).scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive or unauthorized reviewer.")

    return user
