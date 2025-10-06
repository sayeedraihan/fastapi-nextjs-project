from sqlmodel import Session

from src.models.db_models import Performance


def add_performance(session: Session, performance: Performance) -> Performance:
    session.add(performance)
    session.commit()
    session.refresh(performance)
    return performance
