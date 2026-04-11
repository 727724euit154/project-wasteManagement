"""add listing fields and transaction delivery address

Revision ID: v5_listing_fields
Revises: v4_environmental
Create Date: 2026-04-12
"""
from alembic import op
import sqlalchemy as sa

revision = 'v5_listing_fields'
down_revision = 'v4_environmental'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.execute('''
        ALTER TABLE listings
            ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,6),
            ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,6),
            ADD COLUMN IF NOT EXISTS price NUMERIC(15,2),
            ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(15,2),
            ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS contact_number VARCHAR(100);
    ''')
    op.execute('''
        ALTER TABLE listings
            ALTER COLUMN location DROP NOT NULL;
    ''')
    op.execute('''
        ALTER TABLE transactions
            ADD COLUMN IF NOT EXISTS delivery_address TEXT;
    ''')

def downgrade() -> None:
    op.execute('ALTER TABLE listings DROP COLUMN IF EXISTS latitude;')
    op.execute('ALTER TABLE listings DROP COLUMN IF EXISTS longitude;')
    op.execute('ALTER TABLE listings DROP COLUMN IF EXISTS price;')
    op.execute('ALTER TABLE listings DROP COLUMN IF EXISTS weight_kg;')
    op.execute('ALTER TABLE listings DROP COLUMN IF EXISTS company_name;')
    op.execute('ALTER TABLE listings DROP COLUMN IF EXISTS contact_number;')
    op.execute('ALTER TABLE transactions DROP COLUMN IF EXISTS delivery_address;')
