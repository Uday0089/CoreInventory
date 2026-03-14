from pydantic import BaseModel
from typing import List

class ProductCreate(BaseModel):
    name: str
    sku: str
    category: str
    unit: str


class ReceiptItem(BaseModel):
    product_id: int
    quantity: int


class ReceiptCreate(BaseModel):
    supplier: str
    items: List[ReceiptItem]