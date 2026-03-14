from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

import models, schemas
from database import engine, SessionLocal

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CoreInventory API")


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------
# Home endpoint
# -------------------------
@app.get("/")
def home():
    return {"message": "Inventory API running"}


# -------------------------
# Create Product
# -------------------------
@app.post("/products")
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    # Check if SKU already exists
    existing = db.query(models.Product).filter(models.Product.sku == product.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")

    new_product = models.Product(
        name=product.name,
        sku=product.sku,
        category=product.category,
        unit=product.unit
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    # Create inventory record
    inventory = models.Inventory(
        product_id=new_product.id,
        quantity=0
    )
    db.add(inventory)
    db.commit()

    return {"message": "Product created", "product": {
        "id": new_product.id,
        "name": new_product.name,
        "sku": new_product.sku,
        "category": new_product.category,
        "unit": new_product.unit
    }}


# -------------------------
# List Products
# -------------------------
@app.get("/products")
def list_products(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    return products


# -------------------------
# Get Inventory
# -------------------------
@app.get("/inventory")
def get_inventory(db: Session = Depends(get_db)):
    inventory = db.query(models.Inventory).all()
    result = []

    for item in inventory:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        result.append({
            "product_id": item.product_id,
            "name": product.name,
            "sku": product.sku,
            "quantity": item.quantity
        })

    return result


# -------------------------
# Create Receipt (Incoming Stock)
# -------------------------
@app.post("/receipts")
def create_receipt(receipt: schemas.ReceiptCreate, db: Session = Depends(get_db)):

    new_receipt = models.Receipt(supplier=receipt.supplier)
    db.add(new_receipt)
    db.commit()
    db.refresh(new_receipt)

    for item in receipt.items:
        # Validate product exists
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

        # Add receipt item
        receipt_item = models.ReceiptItem(
            receipt_id=new_receipt.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(receipt_item)

        # Update inventory
        inventory = db.query(models.Inventory).filter(models.Inventory.product_id == item.product_id).first()
        inventory.quantity += item.quantity

    db.commit()
    return {"message": "Receipt processed, stock updated"}