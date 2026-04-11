"""logistics_payment

Revision ID: v3_logistics_payment
Revises: v2_recycler_profile
Create Date: 2026-04-10 12:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'v3_logistics_payment'
down_revision = 'v2_recycler_profile'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('logistics_requests', sa.Column('payment_offered_usd', sa.Numeric(precision=15, scale=2), server_default='0', nullable=True))

def downgrade() -> None:
    op.drop_column('logistics_requests', 'payment_offered_usd')
