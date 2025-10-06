from sqlmodel import SQLModel, create_engine, Session

sqlite_file_name = 'basic.db'
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True)
SQLModel.metadata.create_all(engine) # creates the database and the tables

def get_session():
    with Session(engine) as session:
        try:
            yield session
        finally:
            print("\n\nClosing DB Session\n\n")