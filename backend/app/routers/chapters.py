
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.chapter import Chapter
from app.models.subject import Subject
from app.schemas import ChapterCreate, ChapterResponse

router = APIRouter(
    prefix="/chapters",
    tags=["Chapters"]
)


# 1. THEM CHUONG HOC
@router.post("/", response_model=ChapterResponse)
def create_chapter(
    chapter: ChapterCreate,
    db: Session = Depends(get_db)
):
    subject = db.query(Subject).filter(
        Subject.id == chapter.subject_id
    ).first()

    if subject is None:
        raise HTTPException(
            status_code=404,
            detail="Mon hoc khong ton tai"
        )

    new_chapter = Chapter(
        subject_id=chapter.subject_id,
        name=chapter.name,
        description=chapter.description,
        order_number=chapter.order_number
    )

    db.add(new_chapter)
    db.commit()
    db.refresh(new_chapter)

    return new_chapter


# 2. LAY DANH SACH CHUONG HOC
@router.get("/", response_model=list[ChapterResponse])
def get_chapters(
    db: Session = Depends(get_db)
):
    return db.query(Chapter).order_by(
        Chapter.subject_id,
        Chapter.order_number
    ).all()


# 3. XEM CHI TIET CHUONG HOC
@router.get("/{chapter_id}", response_model=ChapterResponse)
def get_chapter(
    chapter_id: int,
    db: Session = Depends(get_db)
):
    chapter = db.query(Chapter).filter(
        Chapter.id == chapter_id
    ).first()

    if chapter is None:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay chuong hoc"
        )

    return chapter


# 4. CAP NHAT CHUONG HOC
@router.put("/{chapter_id}", response_model=ChapterResponse)
def update_chapter(
    chapter_id: int,
    chapter_data: ChapterCreate,
    db: Session = Depends(get_db)
):
    chapter = db.query(Chapter).filter(
        Chapter.id == chapter_id
    ).first()

    if chapter is None:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay chuong hoc"
        )

    subject = db.query(Subject).filter(
        Subject.id == chapter_data.subject_id
    ).first()

    if subject is None:
        raise HTTPException(
            status_code=404,
            detail="Mon hoc khong ton tai"
        )

    chapter.subject_id = chapter_data.subject_id
    chapter.name = chapter_data.name
    chapter.description = chapter_data.description
    chapter.order_number = chapter_data.order_number

    db.commit()
    db.refresh(chapter)

    return chapter


# 5. XOA CHUONG HOC
@router.delete("/{chapter_id}")
def delete_chapter(
    chapter_id: int,
    db: Session = Depends(get_db)
):
    chapter = db.query(Chapter).filter(
        Chapter.id == chapter_id
    ).first()

    if chapter is None:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay chuong hoc"
        )

    db.delete(chapter)
    db.commit()

    return {
        "message": "Xoa chuong hoc thanh cong"
    }
