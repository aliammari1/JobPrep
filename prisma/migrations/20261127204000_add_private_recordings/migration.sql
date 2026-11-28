ALTER TABLE "interview"
    ADD COLUMN "recordingObjectKey" TEXT,
    ADD COLUMN "recordingFileName" TEXT,
    ADD COLUMN "recordingContentType" TEXT,
    ADD COLUMN "recordingSize" INTEGER;

CREATE UNIQUE INDEX "interview_recordingObjectKey_key" ON "interview"("recordingObjectKey");

CREATE TABLE "recording_object_cleanup" (
    "objectKey" TEXT PRIMARY KEY,
    "deleteAfter" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX "recording_object_cleanup_deleteAfter_idx"
    ON "recording_object_cleanup"("deleteAfter");

CREATE FUNCTION enqueue_recording_object_cleanup() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF OLD."recordingObjectKey" IS NOT DISTINCT FROM NEW."recordingObjectKey" THEN
            RETURN NULL;
        END IF;
        IF NEW."recordingObjectKey" IS NOT NULL THEN
            DELETE FROM "recording_object_cleanup" WHERE "objectKey" = NEW."recordingObjectKey";
        END IF;
    END IF;

    IF OLD."recordingObjectKey" IS NOT NULL THEN
        INSERT INTO "recording_object_cleanup" ("objectKey", "deleteAfter")
        VALUES (OLD."recordingObjectKey", CURRENT_TIMESTAMP)
        ON CONFLICT ("objectKey") DO UPDATE
        SET "deleteAfter" = EXCLUDED."deleteAfter", "attempts" = 0;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER "interview_recording_cleanup"
AFTER UPDATE OF "recordingObjectKey" OR DELETE ON "interview"
FOR EACH ROW EXECUTE FUNCTION enqueue_recording_object_cleanup();
