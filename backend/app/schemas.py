from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, condecimal, constr, validator


class StockMovementType(str, Enum):
    IN = "IN"
    OUT = "OUT"
    ADJUST = "ADJUST"


class CategoryCreate(BaseModel):
    name: constr(min_length=1)
    description: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: Optional[constr(min_length=1)] = None
    description: Optional[str] = None


class CategoryRead(BaseModel):
    id: int
    name: str
    description: Optional[str]

    class Config:
        from_attributes = True


class WarehouseCreate(BaseModel):
    name: constr(min_length=1)
    location: Optional[str] = None


class WarehouseUpdate(BaseModel):
    name: Optional[constr(min_length=1)] = None
    location: Optional[str] = None


class WarehouseRead(BaseModel):
    id: int
    name: str
    location: Optional[str]

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    sku: constr(min_length=1)
    name: constr(min_length=1)
    category_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    quantity: Optional[int] = 0
    unit_price: Optional[condecimal(max_digits=10, decimal_places=2)] = 0


class ProductUpdate(BaseModel):
    sku: Optional[constr(min_length=1)] = None
    name: Optional[constr(min_length=1)] = None
    category_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    quantity: Optional[int] = None
    unit_price: Optional[condecimal(max_digits=10, decimal_places=2)] = None


class ProductRead(BaseModel):
    id: int
    sku: str
    name: str
    category_id: Optional[int]
    warehouse_id: Optional[int]
    quantity: int
    unit_price: condecimal(max_digits=10, decimal_places=2)

    class Config:
        from_attributes = True


class StockMovementCreate(BaseModel):
    product_id: int
    warehouse_id: int
    change_qty: int
    type: StockMovementType
    note: Optional[str] = None


class StockMovementRead(BaseModel):
    id: int
    product_id: int
    warehouse_id: int
    change_qty: int
    type: StockMovementType
    note: Optional[str]

    class Config:
        from_attributes = True


# --- Auth / Users ---

class LoginCredentials(BaseModel):
    email: EmailStr
    password: str


class RegisterCredentials(BaseModel):
    firstName: constr(min_length=1)
    lastName: constr(min_length=1)
    email: EmailStr
    password: str
    confirmPassword: str

    @validator("confirmPassword")
    def passwords_match(cls, v: str, values: dict) -> str:
        if "password" in values and v != values["password"]:
            raise ValueError("Passwords do not match")
        return v


class ChangePasswordRequest(BaseModel):
    email: EmailStr
    currentPassword: str
    newPassword: str
    confirmPassword: str

    @validator("confirmPassword")
    def passwords_match(cls, v: str, values: dict) -> str:
        if "newPassword" in values and v != values["newPassword"]:
            raise ValueError("Passwords do not match")
        return v


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserRead(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str

    class Config:
        from_attributes = True
