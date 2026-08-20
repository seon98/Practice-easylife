from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

# Alembic이 FK, PK, INDEX 등의 이름을
# 일관되게 생성할 수 있도록 규칙을 지정합니다.
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": ("fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s"),
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(
        naming_convention=NAMING_CONVENTION,
    )
