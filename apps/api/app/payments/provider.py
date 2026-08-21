import hashlib
import hmac
import uuid

from app.config import get_settings
from app.payments.base import CheckoutSession, PaymentProvider


class ConfigurationReadyProvider(PaymentProvider):
    """Credentials가 없을 때 안전하게 결제를 비활성화하는 provider."""

    async def create_checkout(self, *, user_id: int, plan_code: str) -> CheckoutSession:
        del user_id, plan_code
        return CheckoutSession(
            checkout_id=f"config_{uuid.uuid4().hex}",
            provider="configuration-ready",
            status="unavailable",
            message="결제 사업자와 운영 자격 증명 설정이 필요합니다.",
        )

    def verify_webhook(self, *, body: bytes, signature: str) -> bool:
        secret = get_settings().payment_webhook_secret
        if not secret:
            return False
        expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)


def get_payment_provider() -> PaymentProvider:
    return ConfigurationReadyProvider()
