# from typing import Optional, List
# from sqlalchemy.orm import Session
# from app.models.scan_analysis import ScanAnalysis
# from app.db.schemas.scan_analysis import ScanAnalysisCreate, ScanAnalysisUpdate

# class ScanAnalysisRepository:
#     def __init__(self, db: Session):
#         self.db = db

#     def get(self, scan_analysis_id: int) -> Optional[ScanAnalysis]:
#         return self.db.query(ScanAnalysis).filter(ScanAnalysis.id == scan_analysis_id).first()

#     def get_all(self, skip: int = 0, limit: int = 100) -> List[ScanAnalysis]:
#         return self.db.query(ScanAnalysis).offset(skip).limit(limit).all()

#     def create(self, scan_analysis_in: ScanAnalysisCreate) -> ScanAnalysis:
#         scan_analysis = ScanAnalysis(**scan_analysis_in.dict())
#         self.db.add(scan_analysis)
#         self.db.commit()
#         self.db.refresh(scan_analysis)
#         return scan_analysis

#     def update(self, scan_analysis_id: int, scan_analysis_in: ScanAnalysisUpdate) -> Optional[ScanAnalysis]:
#         scan_analysis = self.get(scan_analysis_id)
#         if not scan_analysis:
#             return None
#         for field, value in scan_analysis_in.dict(exclude_unset=True).items():
#             setattr(scan_analysis, field, value)
#         self.db.commit()
#         self.db.refresh(scan_analysis)
#         return scan_analysis

#     def delete(self, scan_analysis_id: int) -> bool:
#         scan_analysis = self.get(scan_analysis_id)
#         if not scan_analysis:
#             return False
#         self.db.delete(scan_analysis)
#         self.db.commit()
#         return True