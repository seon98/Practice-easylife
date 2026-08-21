from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import UserModel
from app.rate_limit import limit_auth_attempts
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse
from app.schemas.user import UserResponse
from app.security import create_access_token, get_current_user
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(limit_auth_attempts)])
async def signup(payload: SignupRequest, session: Annotated[AsyncSession, Depends(get_db)]) -> TokenResponse:
    if await auth_service.get_user_by_email(session, payload.email):
        raise HTTPException(status.HTTP_409_CONFLICT, "Email is already registered")
    user = await auth_service.create_user(session, payload.email, payload.password)
    return TokenResponse(access_token=create_access_token(user), user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse, dependencies=[Depends(limit_auth_attempts)])
async def login(
    payload: LoginRequest,
    session: Annotated[AsyncSession, Depends(get_db)],
    client_id: Annotated[UUID | None, Header(alias="X-Client-ID")] = None,
) -> TokenResponse:
    user = await auth_service.authenticate(session, payload.email, payload.password)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    if client_id:
        await auth_service.merge_anonymous_favorites(session, client_id, user)
    return TokenResponse(access_token=create_access_token(user), user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
async def me(user: Annotated[UserModel, Depends(get_current_user)]) -> UserResponse:
    return UserResponse.model_validate(user)
