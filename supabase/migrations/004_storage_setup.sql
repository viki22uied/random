-- ============================================
-- HDIMS: Storage Bucket Setup & Policies
-- ============================================

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('facility-documents', 'facility-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- HOSPITAL_USER: Upload to own facility folder
CREATE POLICY "hospital_user_upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'facility-documents'
    AND (storage.foldername(name))[1] = (
      SELECT facility_id::TEXT FROM users WHERE id = auth.uid()
    )
  );

-- Users can view files based on facility access
CREATE POLICY "users_select_files" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'facility-documents'
    AND (
      -- Hospital user: own facility
      (storage.foldername(name))[1] = (
        SELECT facility_id::TEXT FROM users WHERE id = auth.uid()
      )
      -- District admin: district facilities
      OR EXISTS (
        SELECT 1 FROM users u
        JOIN facilities f ON f.district_id = u.district_id
        WHERE u.id = auth.uid()
        AND u.role = 'district_admin'
        AND f.id::TEXT = (storage.foldername(name))[1]
      )
      -- State/Super admin: all files
      OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN ('state_admin', 'super_admin')
      )
    )
  );

-- Only uploader or admin can delete
CREATE POLICY "users_delete_files" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'facility-documents'
    AND (
      owner = auth.uid()
      OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'super_admin'
      )
    )
  );
