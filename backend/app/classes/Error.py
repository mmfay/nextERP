from fastapi import HTTPException, status

class Error:

    @staticmethod
    def bad_request(title: str, detail: str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{title}: {detail}"
        )
    
    @staticmethod
    def not_found(title: str, detail: str):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{title}: {detail}"
        )

    @staticmethod
    def conflict(title: str, detail: str):
        """Use for optimistic concurrency/version conflicts (HTTP 409)."""
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{title}: {detail}"
        )