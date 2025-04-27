from minio import Minio
from app.core.config import settings

# Initialize MinIO client
minio_client = Minio(
    endpoint=settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_SECURE
)

# Create buckets if they don't exist
def create_buckets():
    buckets = [settings.BUCKET_RESULTS, settings.BUCKET_REPORTS, settings.BUCKET_CACHE]
    for bucket in buckets:
        if not minio_client.bucket_exists(bucket):
            minio_client.make_bucket(bucket)
            # Set public read policy for results and reports
            if bucket in [settings.BUCKET_RESULTS, settings.BUCKET_REPORTS]:
                policy = {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {"AWS": "*"},
                            "Action": ["s3:GetObject"],
                            "Resource": [f"arn:aws:s3:::{bucket}/*"]
                        }
                    ]
                }
                minio_client.set_bucket_policy(bucket, policy)

# Get presigned URL for object
def get_presigned_url(bucket_name, object_name, expires=3600):
    """
    Generate a presigned URL for an object
    """
    try:
        return minio_client.presigned_get_object(
            bucket_name=bucket_name,
            object_name=object_name,
            expires=expires
        )
    except Exception as e:
        print(f"Error generating presigned URL: {e}")
        return None

# Upload file to MinIO
def upload_file(bucket_name, object_name, file_path):
    """
    Upload a file to MinIO
    """
    try:
        minio_client.fput_object(
            bucket_name=bucket_name,
            object_name=object_name,
            file_path=file_path
        )
        return True
    except Exception as e:
        print(f"Error uploading file: {e}")
        return False
