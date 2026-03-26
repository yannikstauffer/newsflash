CREATE TABLE user_settings (
                               user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
                               key        text NOT NULL,
                               data       jsonb NOT NULL DEFAULT '{}',
                               updated_at timestamptz NOT NULL DEFAULT now(),
                               PRIMARY KEY (user_id, key)
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own settings"
  ON user_settings FOR SELECT
                                  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);
