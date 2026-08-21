from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class DeliveryResult:
    status: str
    provider: str


class EmailProvider(Protocol):
    async def send(
        self, *, recipient: str, subject: str, body: str
    ) -> DeliveryResult: ...


class ConfigurationReadyEmailProvider:
    """외부 자격 증명이 없을 때 발송을 가장하지 않는 안전한 backend."""

    async def send(self, *, recipient: str, subject: str, body: str) -> DeliveryResult:
        del recipient, subject, body
        return DeliveryResult(status="not_configured", provider="configuration-ready")


def get_email_provider() -> EmailProvider:
    return ConfigurationReadyEmailProvider()
