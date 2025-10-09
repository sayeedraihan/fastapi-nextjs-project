from sqlmodel import SQLModel, Field
from typing import Optional

"""
* ITEM TABLE
"""
class ItemBase(SQLModel):
    name: Optional[str] = None
    price: Optional[float] = 0.0
    brand: Optional[str] = None

class Item(ItemBase, table=True): # registered with SQLModel.metadata attribute
    id: int = Field(None, primary_key=True)