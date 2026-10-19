
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.security import require_roles

from app.database.database import get_db
from app.models.subject import Subject
from app.schemas import SubjectCreate, SubjectResponse

router = APIRouter(prefix="/subjects", tags=["Subjects"])


@router.post("/", response_model=SubjectResponse)
def create_subject(
    subject: SubjectCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(Subject).filter(
        Subject.code == subject.code
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Mã môn học đã tồn tại"
        )

    new_subject = Subject(
        name=subject.name,
        code=subject.code,
        description=subject.description
    )

    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)

    return new_subject


@router.get("/", response_model=list[SubjectResponse])
def get_subjects(db: Session = Depends(get_db)):
    current_user=Depends(require_roles("ADMIN"))
    return db.query(Subject).all()

# XEM CHI TIET MON HOC
@router.get("/{subject_id}", response_model=SubjectResponse)
def get_subject(
    subject_id: int,
    db: Session = Depends(get_db)
):
    subject = db.query(Subject).filter(
        Subject.id == subject_id
    ).first()

    if subject is None:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay mon hoc"
        )

    return subject


# CAP NHAT MON HOC
@router.put("/{subject_id}", response_model=SubjectResponse)
def update_subject(
    subject_id: int,
    subject_data: SubjectCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("ADMIN"))
):
    subject = db.query(Subject).filter(
        Subject.id == subject_id
    ).first()

    if subject is None:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay mon hoc"
        )

    subject.name = subject_data.name
    subject.code = subject_data.code
    subject.description = subject_data.description

    db.commit()
    db.refresh(subject)

    return subject


# XOA MON HOC
@router.delete("/{subject_id}")
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("ADMIN"))
):
    subject = db.query(Subject).filter(
        Subject.id == subject_id
    ).first()

    if subject is None:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay mon hoc"
        )

    db.delete(subject)
    db.commit()

    return {"message": "Xoa mon hoc thanh cong"}
