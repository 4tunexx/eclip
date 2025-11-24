ALTER TABLE IF EXISTS server_instances
  ADD COLUMN IF NOT EXISTS gcp_instance_id TEXT;