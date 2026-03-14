from fastapi import Depends, FastAPI, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import Base, engine, get_db


# Ensure models are registered. In production, use Alembic (migration tool).
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CoreInventory API")


@app.get("/", tags=["meta"])
def root() -> dict:
    return {"message": "CoreInventory FastAPI backend is running."}


# --- Categories ---

@app.get("/categories", response_model=list[schemas.CategoryRead], tags=["categories"])
def list_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)


@app.get("/categories/{category_id}", response_model=schemas.CategoryRead, tags=["categories"])
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = crud.get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@app.post("/categories", response_model=schemas.CategoryRead, status_code=201, tags=["categories"])
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_category(db, category)
    except IntegrityError as e:
        raise HTTPException(status_code=400, detail="Category already exists") from e


@app.patch("/categories/{category_id}", response_model=schemas.CategoryRead, tags=["categories"])
def update_category(category_id: int, updates: schemas.CategoryUpdate, db: Session = Depends(get_db)):
    category = crud.update_category(db, category_id, updates)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@app.delete("/categories/{category_id}", tags=["categories"])
def delete_category(category_id: int, db: Session = Depends(get_db)):
    if not crud.delete_category(db, category_id):
        raise HTTPException(status_code=404, detail="Category not found")
    return {"deleted": True}


# --- Warehouses ---

@app.get("/warehouses", response_model=list[schemas.WarehouseRead], tags=["warehouses"])
def list_warehouses(db: Session = Depends(get_db)):
    return crud.get_warehouses(db)


@app.get("/warehouses/{warehouse_id}", response_model=schemas.WarehouseRead, tags=["warehouses"])
def get_warehouse(warehouse_id: int, db: Session = Depends(get_db)):
    warehouse = crud.get_warehouse(db, warehouse_id)
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse


@app.post("/warehouses", response_model=schemas.WarehouseRead, status_code=201, tags=["warehouses"])
def create_warehouse(warehouse: schemas.WarehouseCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_warehouse(db, warehouse)
    except IntegrityError as e:
        raise HTTPException(status_code=400, detail="Warehouse already exists") from e


@app.patch("/warehouses/{warehouse_id}", response_model=schemas.WarehouseRead, tags=["warehouses"])
def update_warehouse(warehouse_id: int, updates: schemas.WarehouseUpdate, db: Session = Depends(get_db)):
    warehouse = crud.update_warehouse(db, warehouse_id, updates)
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse


@app.delete("/warehouses/{warehouse_id}", tags=["warehouses"])
def delete_warehouse(warehouse_id: int, db: Session = Depends(get_db)):
    if not crud.delete_warehouse(db, warehouse_id):
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return {"deleted": True}


# --- Products ---

@app.get("/products", response_model=list[schemas.ProductRead], tags=["products"])
def list_products(db: Session = Depends(get_db)):
    return crud.get_products(db)


@app.get("/products/{product_id}", response_model=schemas.ProductRead, tags=["products"])
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.post("/products", response_model=schemas.ProductRead, status_code=201, tags=["products"])
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_product(db, product)
    except IntegrityError as e:
        raise HTTPException(status_code=400, detail="Product with that SKU already exists") from e


@app.patch("/products/{product_id}", response_model=schemas.ProductRead, tags=["products"])
def update_product(product_id: int, updates: schemas.ProductUpdate, db: Session = Depends(get_db)):
    product = crud.update_product(db, product_id, updates)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.delete("/products/{product_id}", tags=["products"])
def delete_product(product_id: int, db: Session = Depends(get_db)):
    if not crud.delete_product(db, product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    return {"deleted": True}


# --- Stock Movements ---

@app.get("/stock_movements", response_model=list[schemas.StockMovementRead], tags=["stock_movements"])
def list_stock_movements(
    product_id: int | None = Query(None), warehouse_id: int | None = Query(None), db: Session = Depends(get_db)
):
    return crud.get_stock_movements(db, product_id=product_id, warehouse_id=warehouse_id)


@app.get("/stock_movements/{movement_id}", response_model=schemas.StockMovementRead, tags=["stock_movements"])
def get_stock_movement(movement_id: int, db: Session = Depends(get_db)):
    movement = crud.get_stock_movement(db, movement_id)
    if not movement:
        raise HTTPException(status_code=404, detail="Stock movement not found")
    return movement


@app.post("/stock_movements", response_model=schemas.StockMovementRead, status_code=201, tags=["stock_movements"])
def create_stock_movement(movement: schemas.StockMovementCreate, db: Session = Depends(get_db)):
    return crud.create_stock_movement(db, movement)


@app.delete("/stock_movements/{movement_id}", tags=["stock_movements"])
def delete_stock_movement(movement_id: int, db: Session = Depends(get_db)):
    if not crud.delete_stock_movement(db, movement_id):
        raise HTTPException(status_code=404, detail="Stock movement not found")
    return {"deleted": True}
