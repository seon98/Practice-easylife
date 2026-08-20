from app.schemas.service import ServiceResponse

_SERVICES: tuple[ServiceResponse, ...] = (
    ServiceResponse(
        id=1,
        name="정부24",
        description=(
            "주민등록등본, 각종 증명서 발급 등 정부 민원 서비스를 이용할 수 있습니다."
        ),
        category="공공",
        url="https://www.gov.kr",
    ),
    ServiceResponse(
        id=2,
        name="홈택스",
        description=(
            "세금 신고, 납부, 사업자 관련 업무 등을 온라인으로 처리할 수 있습니다."
        ),
        category="세금",
        url="https://www.hometax.go.kr",
    ),
    ServiceResponse(
        id=3,
        name="복지로",
        description=(
            "복지 서비스 검색과 복지 급여 신청 등에 필요한 정보를 제공합니다."
        ),
        category="복지",
        url="https://www.bokjiro.go.kr",
    ),
    ServiceResponse(
        id=4,
        name="고용24",
        description=("채용 정보와 취업 지원 등 고용 관련 서비스를 확인할 수 있습니다."),
        category="취업",
        url="https://www.work24.go.kr",
    ),
    ServiceResponse(
        id=5,
        name="K-Startup",
        description=(
            "예비 창업자와 창업 기업을 위한 지원사업과 창업 정보를 제공합니다."
        ),
        category="창업",
        url="https://www.k-startup.go.kr",
    ),
    ServiceResponse(
        id=6,
        name="공공데이터포털",
        description=(
            "정부와 공공기관이 제공하는 데이터와 OpenAPI를 검색할 수 있습니다."
        ),
        category="데이터",
        url="https://www.data.go.kr",
    ),
)


def list_services() -> list[ServiceResponse]:
    """전체 서비스 목록을 반환합니다."""
    return list(_SERVICES)


def get_service(
    service_id: int,
) -> ServiceResponse | None:
    """ID에 해당하는 서비스를 반환합니다."""

    return next(
        (service for service in _SERVICES if service.id == service_id),
        None,
    )
