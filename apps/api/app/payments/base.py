from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class CheckoutSession:
    checkout_id: str
    provider: str
    status: str
    message: str


class PaymentProvider(ABC):
    @abstractmethod
    async def create_checkout(
        self, *, user_id: int, plan_code: str
    ) -> CheckoutSession: ...

    @abstractmethod
    def verify_webhook(self, *, body: bytes, signature: str) -> bool: ...
