from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    email: str
    role: str = "STUDENT"


class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str

    class Config:
        from_attributes = True

class SubjectCreate(BaseModel):
    name: str
    code: str
    description: str | None = None


class SubjectResponse(BaseModel):
    id: int
    name: str
    code: str
    description: str | None = None

    model_config = {"from_attributes": True}

# SCHEMA CHAPTER

class ChapterCreate(BaseModel):
    subject_id: int
    name: str
    description: str | None = None
    order_number: int = 1


class ChapterResponse(BaseModel):
    id: int
    subject_id: int
    name: str
    description: str | None = None
    order_number: int

    model_config = {"from_attributes": True}
