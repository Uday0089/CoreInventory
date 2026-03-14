from datetime import datetime, timedelta
from typing import List, Optional

from sqlalchemy.orm import Session

from . import models, schemas, utils


# ----- Categories -----

def get_categories(db: Session) -> List[models.Category]:
    return db.query(models.Category).order_by(models.Category.id).all()


def get_category(db: Session, category_id: int) -> Optional[models.Category]:
    return db.query(models.Category).filter(models.Category.id == category_id).first()


def create_category(db: Session, category: schemas.CategoryCreate) -> models.Category:
    db_obj = models.Category(**category.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update_category(db: Session, category_id: int, updates: schemas.CategoryUpdate) -> Optional[models.Category]:
    db_obj = get_category(db, category_id)
    if not db_obj:
        return None

    for field, value in updates.dict(exclude_unset=True).items():
        setattr(db_obj, field, value)

    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_category(db: Session, category_id: int) -> bool:
    db_obj = get_category(db, category_id)
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True


# ----- Warehouses -----

def get_warehouses(db: Session) -> List[models.Warehouse]:
    return db.query(models.Warehouse).order_by(models.Warehouse.id).all()


def get_warehouse(db: Session, warehouse_id: int) -> Optional[models.Warehouse]:
    return db.query(models.Warehouse).filter(models.Warehouse.id == warehouse_id).first()


def create_warehouse(db: Session, warehouse: schemas.WarehouseCreate) -> models.Warehouse:
    db_obj = models.Warehouse(**warehouse.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update_warehouse(db: Session, warehouse_id: int, updates: schemas.WarehouseUpdate) -> Optional[models.Warehouse]:
    db_obj = get_warehouse(db, warehouse_id)
    if not db_obj:
        return None

    for field, value in updates.dict(exclude_unset=True).items():
        setattr(db_obj, field, value)

    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_warehouse(db: Session, warehouse_id: int) -> bool:
    db_obj = get_warehouse(db, warehouse_id)
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True


# ----- Products -----

def get_products(db: Session) -> List[models.Product]:
    return db.query(models.Product).order_by(models.Product.id).all()


def get_product(db: Session, product_id: int) -> Optional[models.Product]:
    return db.query(models.Product).filter(models.Product.id == product_id).first()


def create_product(db: Session, product: schemas.ProductCreate) -> models.Product:
    db_obj = models.Product(**product.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update_product(db: Session, product_id: int, updates: schemas.ProductUpdate) -> Optional[models.Product]:
    db_obj = get_product(db, product_id)
    if not db_obj:
        return None

    for field, value in updates.dict(exclude_unset=True).items():
        setattr(db_obj, field, value)

    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_product(db: Session, product_id: int) -> bool:
    db_obj = get_product(db, product_id)
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True


# ----- Stock Movements -----

def get_stock_movements(
    db: Session, product_id: Optional[int] = None, warehouse_id: Optional[int] = None
) -> List[models.StockMovement]:
    query = db.query(models.StockMovement)
    if product_id is not None:
        query = query.filter(models.StockMovement.product_id == product_id)
    if warehouse_id is not None:
        query = query.filter(models.StockMovement.warehouse_id == warehouse_id)
    return query.order_by(models.StockMovement.created_at.desc()).all()


def get_stock_movement(db: Session, movement_id: int) -> Optional[models.StockMovement]:
    return db.query(models.StockMovement).filter(models.StockMovement.id == movement_id).first()


def create_stock_movement(db: Session, movement: schemas.StockMovementCreate) -> models.StockMovement:
    db_obj = models.StockMovement(**movement.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_stock_movement(db: Session, movement_id: int) -> bool:
    db_obj = get_stock_movement(db, movement_id)
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True


# ----- Users / Auth -----

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def create_user(db: Session, user_data: schemas.RegisterCredentials) -> models.User:
    hashed_password = utils.hash_password(user_data.password)
    db_obj = models.User(
        first_name=user_data.firstName.strip(),
        last_name=user_data.lastName.strip(),
        email=user_data.email.lower(),
        hashed_password=hashed_password,
        is_verified=1,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def verify_user_password(db: Session, email: str, password: str) -> Optional[models.User]:
    user = get_user_by_email(db, email.lower())
    if not user:
        return None
    if not utils.verify_password(password, user.hashed_password):
        return None
    return user


def change_user_password(db: Session, email: str, current_password: str, new_password: str) -> bool:
    user = verify_user_password(db, email, current_password)
    if not user:
        return False
    user.hashed_password = utils.hash_password(new_password)
    db.commit()
    return True
