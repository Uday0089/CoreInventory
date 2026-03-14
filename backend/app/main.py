from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import crud, models, schemas, utils
from .database import Base, engine, get_db


# Ensure models are registered. In production, use Alembic (migration tool).
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CoreInventory API")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login/verify")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    user_id = utils.decode_access_token(token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user = crud.get_user(db, int(user_id))
    if not user or not user.is_verified:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    return user


@app.get("/", tags=["meta"])
def root() -> dict:
    return {"message": "CoreInventory FastAPI backend is running."}


# --- Auth ---

@app.post("/auth/register", response_model=schemas.UserRead, status_code=201, tags=["auth"])
def register(credentials: schemas.RegisterCredentials, db: Session = Depends(get_db)) -> schemas.UserRead:
    if not utils.validate_name(credentials.firstName) or not utils.validate_name(credentials.lastName):
        raise HTTPException(status_code=400, detail="Name must contain only letters and spaces")

    if not utils.validate_password(credentials.password):
        raise HTTPException(
            status_code=400,
            detail=(
                "Password must be at least 6 characters and include 1 uppercase, 1 lowercase, 1 digit, and 1 symbol"
            ),
        )

    if crud.get_user_by_email(db, credentials.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    user = crud.create_user(db, credentials)
    return user


@app.post("/auth/login", response_model=schemas.AuthResponse, tags=["auth"])
def login(credentials: schemas.LoginCredentials, db: Session = Depends(get_db)) -> schemas.AuthResponse:
    user = crud.verify_user_password(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = utils.create_access_token(str(user.id))
    return schemas.AuthResponse(access_token=token)


@app.post("/auth/change-password", tags=["auth"])
def change_password(request: schemas.ChangePasswordRequest, db: Session = Depends(get_db)) -> dict:
    if not utils.validate_password(request.newPassword):
        raise HTTPException(
            status_code=400,
            detail=(
                "Password must be at least 6 characters and include 1 uppercase, 1 lowercase, 1 digit, and 1 symbol"
            ),
        )

    success = crud.change_user_password(db, request.email, request.currentPassword, request.newPassword)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid email or current password")

    return {"message": "Password changed"}


@app.get("/auth/me", response_model=schemas.UserRead, tags=["auth"])
def read_current_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    return current_user


@app.get("/auth/me", response_model=schemas.UserRead, tags=["auth"])
def read_current_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    return current_user


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
