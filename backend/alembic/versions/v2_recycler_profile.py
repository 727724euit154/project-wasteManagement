"""recycler_profile

Revision ID: v2_recycler_profile
Revises: v1_initial
Create Date: 2026-04-10 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'v2_recycler_profile'
down_revision = 'v1_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('recycler_locations', sa.Column('specialized_materials', sa.String(length=255), nullable=True))
    op.add_column('recycler_locations', sa.Column('processing_capacity_tons', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('recycler_locations', sa.Column('service_radius_km', sa.Numeric(precision=10, scale=2), nullable=True))


def downgrade() -> None:
    op.drop_column('recycler_locations', 'service_radius_km')
    op.drop_column('recycler_locations', 'processing_capacity_tons')
    op.drop_column('recycler_locations', 'specialized_materials')
