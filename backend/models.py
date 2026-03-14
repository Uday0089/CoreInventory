from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    sku = Column(String(100), unique=True)
    category = Column(String(100))
    unit = Column(String(20))


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=0)


class Receipt(Base):
    __tablename__ = "receipts"

    id = Column(Integer, primary_key=True)
    supplier = Column(String(100))


class ReceiptItem(Base):
    __tablename__ = "receipt_items"

    id = Column(Integer, primary_key=True)
    receipt_id = Column(Integer, ForeignKey("receipts.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)