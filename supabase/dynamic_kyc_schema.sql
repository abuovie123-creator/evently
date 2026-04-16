-- Add optional dynamic KYC fields
ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS kyc_requirements JSONB DEFAULT '[
  {"id": "nin", "label": "NIN (National Identity Number)", "type": "text", "required": true},
  {"id": "id_card", "label": "Government ID Document", "type": "file", "required": true},
  {"id": "passport", "label": "Passport Photograph", "type": "file", "required": true}
]'::jsonb;

ALTER TABLE public.planners ADD COLUMN IF NOT EXISTS kyc_data JSONB DEFAULT '{}'::jsonb;
